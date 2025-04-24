import asyncio
import inspect
import os
import platform
import signal
import socket
import sys
import time
import warnings
from contextlib import suppress
from pathlib import Path

import click
import httpx
import typer
from dotenv import load_dotenv
from httpx import HTTPError
from multiprocess import cpu_count
from multiprocess.context import Process
from packaging import version as pkg_version
from rich import box
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from sqlmodel import select

from langflow.initial_setup.setup import get_or_create_default_folder
from langflow.logging.logger import configure, logger
from langflow.main import setup_app
from langflow.services.database.utils import session_getter
from langflow.services.deps import get_db_service, get_settings_service, session_scope
from langflow.services.settings.constants import DEFAULT_SUPERUSER
from langflow.services.utils import initialize_services
from langflow.utils.version import fetch_latest_version, get_version_info
from langflow.utils.version import is_pre_release as langflow_is_pre_release

console = Console()

app = typer.Typer(no_args_is_help=True)


def get_number_of_workers(workers=None):
    if workers == -1 or workers is None:
        workers = (cpu_count() * 2) + 1
    logger.debug(f"Number of workers: {workers}")
    return workers


def display_results(results) -> None:
    """Display the results of the migration."""
    for table_results in results:
        table = Table(title=f"Migration {table_results.table_name}")
        table.add_column("Name")
        table.add_column("Type")
        table.add_column("Status")

        for result in table_results.results:
            status = "Success" if result.success else "Failure"
            color = "green" if result.success else "red"
            table.add_row(result.name, result.type, f"[{color}]{status}[/{color}]")

        console.print(table)
        console.print()  # Print a new line


def set_var_for_macos_issue() -> None:
    # OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
    # we need to set this var is we are running on MacOS
    # otherwise we get an error when running gunicorn

    if platform.system() == "Darwin":
        import os

        os.environ["OBJC_DISABLE_INITIALIZE_FORK_SAFETY"] = "YES"
        # https://stackoverflow.com/questions/75747888/uwsgi-segmentation-fault-with-flask-python-app-behind-nginx-after-running-for-2 # noqa: E501
        os.environ["no_proxy"] = "*"  # to avoid error with gunicorn
        logger.debug("将 OBJC_DISABLE_INITIALIZE_FORK_SAFETY 设置为 YES 以避免错误")


def handle_sigterm(signum, frame):  # noqa: ARG001
    """Handle SIGTERM signal gracefully."""
    logger.info("收到 SIGTERM 信号。正在执行正常关闭...")
    # Raise SystemExit to trigger graceful shutdown
    sys.exit(0)


@app.command()
def run(
    *,
    host: str | None = typer.Option(None, help="Host to bind the server to.", show_default=False),
    workers: int | None = typer.Option(None, help="Number of worker processes.", show_default=False),
    worker_timeout: int | None = typer.Option(None, help="Worker timeout in seconds.", show_default=False),
    port: int | None = typer.Option(None, help="Port to listen on.", show_default=False),
    components_path: Path | None = typer.Option(
        Path(__file__).parent / "components",
        help="包含自定义组件的目录的路径。",
        show_default=False,
    ),
    # .env file param
    env_file: Path | None = typer.Option(
        None,
        help="包含环境变量的 .env 文件的路径。",
        show_default=False,
    ),
    log_level: str | None = typer.Option(None, help="日志记录级别。", show_default=False),
    log_file: Path | None = typer.Option(None, help="日志文件的路径。", show_default=False),
    cache: str | None = typer.Option(  # noqa: ARG001
        None,
        help="Type of cache to use. (InMemoryCache, SQLiteCache)",
        show_default=False,
    ),
    dev: bool | None = typer.Option(None, help="Run in development mode (may contain bugs)", show_default=False),  # noqa: ARG001
    frontend_path: str | None = typer.Option(
        None,
        help="Path to the frontend directory containing build files. This is for development purposes only.",
        show_default=False,
    ),
    open_browser: bool | None = typer.Option(
        None,
        help="启动服务器后打开浏览器。",
        show_default=False,
    ),
    remove_api_keys: bool | None = typer.Option(  # noqa: ARG001
        None,
        help="Remove API keys from the projects saved in the database.",
        show_default=False,
    ),
    backend_only: bool | None = typer.Option(
        None,
        help="Run only the backend server without the frontend.",
        show_default=False,
    ),
    store: bool | None = typer.Option(  # noqa: ARG001
        None,
        help="Enables the store features.",
        show_default=False,
    ),
    auto_saving: bool | None = typer.Option(  # noqa: ARG001
        None,
        help="Defines if the auto save is enabled.",
        show_default=False,
    ),
    auto_saving_interval: int | None = typer.Option(  # noqa: ARG001
        None,
        help="Defines the debounce time for the auto save.",
        show_default=False,
    ),
    health_check_max_retries: bool | None = typer.Option(  # noqa: ARG001
        None,
        help="Defines the number of retries for the health check.",
        show_default=False,
    ),
    max_file_size_upload: int | None = typer.Option(  # noqa: ARG001
        None,
        help="Defines the maximum file size for the upload in MB.",
        show_default=False,
    ),
    webhook_polling_interval: int | None = typer.Option(  # noqa: ARG001
        None,
        help="Defines the polling interval for the webhook.",
        show_default=False,
    ),
    ssl_cert_file_path: str | None = typer.Option(
        None, help="Defines the SSL certificate file path.", show_default=False
    ),
    ssl_key_file_path: str | None = typer.Option(None, help="Defines the SSL key file path.", show_default=False),
) -> None:
    """Run Langflow."""
    # Register SIGTERM handler
    signal.signal(signal.SIGTERM, handle_sigterm)

    if env_file:
        load_dotenv(env_file, override=True)

    configure(log_level=log_level, log_file=log_file)
    logger.debug(f"从文件加载配置: '{env_file}'" if env_file else "不提供env_file。")
    set_var_for_macos_issue()
    settings_service = get_settings_service()

    for key, value in os.environ.items():
        new_key = key.replace("LANGFLOW_", "")
        if hasattr(settings_service.auth_settings, new_key):
            setattr(settings_service.auth_settings, new_key, value)

    frame = inspect.currentframe()
    valid_args: list = []
    values: dict = {}
    if frame is not None:
        arguments, _, _, values = inspect.getargvalues(frame)
        valid_args = [arg for arg in arguments if values[arg] is not None]

    for arg in valid_args:
        if arg == "components_path":
            settings_service.settings.update_settings(components_path=components_path)
        elif hasattr(settings_service.settings, arg):
            settings_service.set(arg, values[arg])
        elif hasattr(settings_service.auth_settings, arg):
            settings_service.auth_settings.set(arg, values[arg])
        logger.debug(f"从 cli 参数加载配置 '{arg}': '{values[arg]}'")

    host = settings_service.settings.host
    port = settings_service.settings.port
    workers = settings_service.settings.workers
    worker_timeout = settings_service.settings.worker_timeout
    log_level = settings_service.settings.log_level
    frontend_path = settings_service.settings.frontend_path
    backend_only = settings_service.settings.backend_only
    ssl_cert_file_path = settings_service.settings.ssl_cert_file if ssl_cert_file_path is None else ssl_cert_file_path
    ssl_key_file_path = settings_service.settings.ssl_key_file if ssl_key_file_path is None else ssl_key_file_path

    # create path object if frontend_path is provided
    static_files_dir: Path | None = Path(frontend_path) if frontend_path else None

    app = setup_app(static_files_dir=static_files_dir, backend_only=backend_only)
    # check if port is being used
    if is_port_in_use(port, host):
        port = get_free_port(port)

    options = {
        "bind": f"{host}:{port}",
        "workers": get_number_of_workers(workers),
        "timeout": worker_timeout,
        "certfile": ssl_cert_file_path,
        "keyfile": ssl_key_file_path,
    }
    protocol = "https" if options["keyfile"] and options["certfile"] else "http"

    # Define an env variable to know if we are just testing the server
    if "pytest" in sys.modules:
        return
    process: Process | None = None
    try:
        if platform.system() == "Windows":
            # Run using uvicorn on MacOS and Windows
            # Windows doesn't support gunicorn
            # MacOS requires an env variable to be set to use gunicorn
            run_on_windows(host, port, log_level, options, app, protocol)
        else:
            # Run using gunicorn on Linux
            process = run_on_mac_or_linux(host, port, log_level, options, app, protocol)
        if open_browser and not backend_only:
            click.launch(f"http://{host}:{port}")
        if process:
            process.join()
    except (KeyboardInterrupt, SystemExit) as e:
        logger.info("正在关闭服务器...")
        if process is not None:
            process.terminate()
            process.join(timeout=15)  # Wait up to 15 seconds for process to terminate
            if process.is_alive():
                logger.warning("进程未正常终止，强制...")
                process.kill()
        raise typer.Exit(0) from e
    except Exception as e:
        logger.exception(e)
        if process is not None:
            process.terminate()
        raise typer.Exit(1) from e


def wait_for_server_ready(host, port, protocol) -> None:
    """通过轮询运行状况终端节点等待服务器准备就绪。"""
    status_code = 0
    while status_code != httpx.codes.OK:
        try:
            status_code = httpx.get(
                f"{protocol}://{host}:{port}/health", verify=host not in ("127.0.0.1", "localhost")
            ).status_code
        except HTTPError:
            time.sleep(1)
        except Exception:  # noqa: BLE001
            logger.opt(exception=True).debug("等待服务器准备就绪时出错。")
            time.sleep(1)


def run_on_mac_or_linux(host, port, log_level, options, app, protocol):
    webapp_process = Process(target=run_langflow, args=(host, port, log_level, options, app))
    webapp_process.start()
    wait_for_server_ready(host, port, protocol)

    print_banner(host, port, protocol)
    return webapp_process


def run_on_windows(host, port, log_level, options, app, protocol) -> None:
    """在 Windows 上运行 Langflow 服务器。"""
    print_banner(host, port, protocol)
    run_langflow(host, port, log_level, options, app)


def is_port_in_use(port, host="localhost"):
    """检查端口是否正在使用中。

    Args:
        port (int): The port number to check.
        host (str): The host to check the port on. Defaults to 'localhost'.

    Returns:
        bool: True if the port is in use, False otherwise.
    """
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex((host, port)) == 0


def get_free_port(port):
    """Given a used port, find a free port.

    Args:
        port (int): The port number to check.

    Returns:
        int: A free port number.
    """
    while is_port_in_use(port):
        port += 1
    return port


def get_letter_from_version(version: str) -> str | None:
    """Get the letter from a pre-release version."""
    if "a" in version:
        return "a"
    if "b" in version:
        return "b"
    if "rc" in version:
        return "rc"
    return None


def build_version_notice(current_version: str, package_name: str) -> str:
    """Build a version notice message if a newer version is available.

    This function checks if there is a newer version of the package available on PyPI
    and returns an appropriate notice message.

    Args:
        current_version (str): The currently installed version of the package
        package_name (str): The name of the package to check

    Returns:
        str: A notice message if a newer version is available, empty string otherwise.
            The message will indicate if the newer version is a pre-release.

    Example:
        >>> build_version_notice("1.0.0", "langflow")
        'A new version of langflow is available: 1.1.0'
    """
    with suppress(httpx.ConnectError):
        latest_version = fetch_latest_version(package_name, include_prerelease=langflow_is_pre_release(current_version))
        if latest_version and pkg_version.parse(current_version) < pkg_version.parse(latest_version):
            release_type = "pre-release" if langflow_is_pre_release(latest_version) else "version"
            return f"新的 {release_type} {package_name} 可用：{latest_version}"
    return ""


def generate_pip_command(package_names, is_pre_release) -> str:
    """Generate the pip install command based on the packages and whether it's a pre-release."""
    base_command = "pip install"
    if is_pre_release:
        return f"{base_command} {' '.join(package_names)} -U --pre"
    return f"{base_command} {' '.join(package_names)} -U"


def stylize_text(text: str, to_style: str, *, is_prerelease: bool) -> str:
    color = "#42a7f5" if is_prerelease else "#6e42f5"
    # return "".join(f"[{color}]{char}[/]" for char in text)
    styled_text = f"[{color}]{to_style}[/]"
    return text.replace(to_style, styled_text)


def print_banner(host: str, port: int, protocol: str) -> None:
    notices = []
    package_names = []  # Track package names for pip install instructions
    is_pre_release = False  # Track if any package is a pre-release
    package_name = ""

    # Use langflow.utils.version to get the version info
    version_info = get_version_info()
    langflow_version = version_info["version"]
    package_name = version_info["package"]
    is_pre_release |= langflow_is_pre_release(langflow_version)  # Update pre-release status

    notice = build_version_notice(langflow_version, package_name)

    notice = stylize_text(notice, package_name, is_prerelease=is_pre_release)
    if notice:
        notices.append(notice)
    package_names.append(package_name)

    # Generate pip command based on the collected data
    pip_command = generate_pip_command(package_names, is_pre_release)

    # Add pip install command to notices if any package needs an update
    if notices:
        notices.append(f"运行 '{pip_command}' 进行更新。")

    [f"[bold]{notice}[/bold]" for notice in notices if notice]
    styled_package_name = stylize_text(
        package_name, package_name, is_prerelease=any("pre-release" in notice for notice in notices)
    )

    title = f"[bold]欢迎来到 {styled_package_name}[/bold]\n"
    info_text = (
        ":star2: GitHub: Star for updates → https://github.com/langflow-ai/langflow\n"
        ":speech_balloon: Discord: Join for support → https://discord.com/invite/EqksyE2EX9"
    )
    telemetry_text = (
        (
            "我们收集匿名使用数据以改进 Langflow。\n"
            "如不收集，请在您的环境中设置：[bold]DO_NOT_TRACK=true[/bold]。"
        )
        if os.getenv("DO_NOT_TRACK", os.getenv("LANGFLOW_DO_NOT_TRACK", "False")).lower() != "true"
        else (
            "我们[bold]不[/bold]收集匿名使用数据来改进 Langflow。\n"
            "要做出贡献，请在您的环境中设置：[bold]DO_NOT_TRACK=false[/bold]。"
        )
    )
    access_link = f"[bold]🟢 打开 Langflow →[/bold] [link={protocol}://{host}:{port}]{protocol}://{host}:{port}[/link]"

    message = f"{title}\n{info_text}\n\n{telemetry_text}\n\n{access_link}"

    console.print(Panel.fit(message, border_style="#7528FC", padding=(1, 2)))


def run_langflow(host, port, log_level, options, app) -> None:
    """Run Langflow server on localhost."""
    if platform.system() == "Windows":
        import uvicorn

        uvicorn.run(
            app,
            host=host,
            port=port,
            log_level=log_level.lower(),
            loop="asyncio",
            ssl_keyfile=options["keyfile"],
            ssl_certfile=options["certfile"],
        )
    else:
        from langflow.server import LangflowApplication

        server = LangflowApplication(app, options)

        def graceful_shutdown(signum, frame):  # noqa: ARG001
            """Gracefully shutdown the server when receiving SIGTERM."""
            # Suppress click exceptions during shutdown
            import click

            click.echo = lambda *args, **kwargs: None  # noqa: ARG005

            logger.info("正常关闭服务器...")
            # For Gunicorn workers, we raise SystemExit to trigger graceful shutdown
            raise SystemExit(0)

        # Register signal handlers
        signal.signal(signal.SIGTERM, graceful_shutdown)
        signal.signal(signal.SIGINT, graceful_shutdown)

        try:
            server.run()
        except (KeyboardInterrupt, SystemExit):
            # Suppress the exception output
            sys.exit(0)


@app.command()
def superuser(
    username: str = typer.Option(..., prompt=True, help="Username for the superuser."),
    password: str = typer.Option(..., prompt=True, hide_input=True, help="Password for the superuser."),
    log_level: str = typer.Option("error", help="Logging level.", envvar="LANGFLOW_LOG_LEVEL"),
) -> None:
    """Create a superuser."""
    configure(log_level=log_level)
    db_service = get_db_service()

    async def _create_superuser():
        await initialize_services()
        async with session_getter(db_service) as session:
            from langflow.services.auth.utils import create_super_user

            if await create_super_user(db=session, username=username, password=password):
                # Verify that the superuser was created
                from langflow.services.database.models.user.model import User

                stmt = select(User).where(User.username == username)
                user: User = (await session.exec(stmt)).first()
                if user is None or not user.is_superuser:
                    typer.echo("超级用户创建失败。")
                    return
                # Now create the first folder for the user
                result = await get_or_create_default_folder(session, user.id)
                if result:
                    typer.echo("默认文件夹创建成功。")
                else:
                    msg = "无法创建默认文件夹。"
                    raise RuntimeError(msg)
                typer.echo("超级用户创建成功。")

            else:
                typer.echo("超级用户创建失败。")

    asyncio.run(_create_superuser())


# command to copy the langflow database from the cache to the current directory
# because now the database is stored per installation
@app.command()
def copy_db() -> None:
    """Copy the database files to the current directory.

    This function copies the 'langflow.db' and 'langflow-pre.db' files from the cache directory to the current
    directory.
    If the files exist in the cache directory, they will be copied to the same directory as this script (__main__.py).

    Returns:
        None
    """
    import shutil

    from platformdirs import user_cache_dir

    cache_dir = Path(user_cache_dir("langflow"))
    db_path = cache_dir / "langflow.db"
    pre_db_path = cache_dir / "langflow-pre.db"
    # It should be copied to the current directory
    # this file is __main__.py and it should be in the same directory as the database
    destination_folder = Path(__file__).parent
    if db_path.exists():
        shutil.copy(db_path, destination_folder)
        typer.echo(f"数据库复制到 {destination_folder}")
    else:
        typer.echo("在缓存目录中找不到数据库。")
    if pre_db_path.exists():
        shutil.copy(pre_db_path, destination_folder)
        typer.echo(f"Pre-release 数据库复制到 {destination_folder}")
    else:
        typer.echo("Pre-release 在缓存目录中找不到数据库。")


async def _migration(*, test: bool, fix: bool) -> None:
    await initialize_services(fix_migration=fix)
    db_service = get_db_service()
    if not test:
        await db_service.run_migrations()
    results = await db_service.run_migrations_test()
    display_results(results)


@app.command()
def migration(
    test: bool = typer.Option(default=True, help="在测试模式下运行迁移。"),  # noqa: FBT001
    fix: bool = typer.Option(  # noqa: FBT001
        default=False,
        help="修复迁移。这是一个破坏性作，只有在您知道自己在做什么时才应该使用.",
    ),
) -> None:
    """Run or test migrations."""
    if fix and not typer.confirm(
        "这将删除修复迁移所需的所有数据。您确定要继续吗？"
    ):
        raise typer.Abort

    asyncio.run(_migration(test=test, fix=fix))


@app.command()
def api_key(
    log_level: str = typer.Option("error", help="Logging level."),
) -> None:
    """如果启用了 API 密钥，则为默认超级用户创建 API 密钥AUTO_LOGIN。

    Args:
        log_level (str, optional): Logging level. Defaults to "error".

    Returns:
        None
    """
    configure(log_level=log_level)

    async def aapi_key():
        await initialize_services()
        settings_service = get_settings_service()
        auth_settings = settings_service.auth_settings
        if not auth_settings.AUTO_LOGIN:
            typer.echo("自动登录已禁用。无法通过 CLI 创建 API 密钥。")
            return None

        async with session_scope() as session:
            from langflow.services.database.models.user.model import User

            stmt = select(User).where(User.username == DEFAULT_SUPERUSER)
            superuser = (await session.exec(stmt)).first()
            if not superuser:
                typer.echo(
                    "找不到默认超级用户。此命令需要启用超级用户和AUTO_LOGIN。"
                )
                return None
            from langflow.services.database.models.api_key import ApiKey, ApiKeyCreate
            from langflow.services.database.models.api_key.crud import create_api_key, delete_api_key

            stmt = select(ApiKey).where(ApiKey.user_id == superuser.id)
            api_key = (await session.exec(stmt)).first()
            if api_key:
                await delete_api_key(session, api_key.id)

            api_key_create = ApiKeyCreate(name="CLI")
            unmasked_api_key = await create_api_key(session, api_key_create, user_id=superuser.id)
            await session.commit()
            return unmasked_api_key

    unmasked_api_key = asyncio.run(aapi_key())
    # Create a banner to display the API key and tell the user it won't be shown again
    if unmasked_api_key:
        api_key_banner(unmasked_api_key)


def show_version(*, value: bool):
    if value:
        default = "DEV"
        raw_info = get_version_info()
        version = raw_info.get("version", default) if raw_info else default
        typer.echo(f"langflow {version}")
        raise typer.Exit


@app.callback()
def version_option(
    *,
    version: bool = typer.Option(
        None,
        "--version",
        "-v",
        callback=show_version,
        is_eager=True,
        help="Show the version and exit.",
    ),
):
    pass


def api_key_banner(unmasked_api_key) -> None:
    is_mac = platform.system() == "Darwin"
    import pyperclip

    pyperclip.copy(unmasked_api_key.api_key)
    panel = Panel(
        f"[bold]已成功创建 API 密钥:[/bold]\n\n"
        f"[bold blue]{unmasked_api_key.api_key}[/bold blue]\n\n"
        "这是唯一一次显示 API 密钥. \n"
        "确保将其存放在安全的位置. \n\n"
        f"API 密钥已复制到您的剪贴板。 [bold]{['Ctrl', 'Cmd'][is_mac]} + V[/bold] 以粘贴它。",
        box=box.ROUNDED,
        border_style="blue",
        expand=False,
    )
    console = Console()
    console.print(panel)


def main() -> None:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        app()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        logger.exception(e)
        raise typer.Exit(1) from e
