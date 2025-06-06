const SvgAnthropicBox = ({ isDark, ...props }) => {
  return isDark ? (
    <svg
      width="38"
      height="38"
      viewBox="0 0 280 196"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M201.88 0H159.04L237.16 196H280L201.88 0Z" fill="#FAFAF8" />
      <path
        d="M78.12 0L0 196H43.68L59.6568 154.84H141.383L157.36 196H201.04L122.92 0H78.12ZM73.7856 118.44L100.52 49.56L127.254 118.44H73.7856Z"
        fill="#FAFAF8"
      />
    </svg>
  ) : (
    <svg
      width="38"
      height="38"
      viewBox="0 0 280 196"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M201.88 0H159.04L237.16 196H280L201.88 0Z" fill="#1F1F1E" />
      <path
        d="M78.12 0L0 196H43.68L59.6568 154.84H141.383L157.36 196H201.04L122.92 0H78.12ZM73.7856 118.44L100.52 49.56L127.254 118.44H73.7856Z"
        fill="#1F1F1E"
      />
    </svg>
  );
};

export default SvgAnthropicBox;
