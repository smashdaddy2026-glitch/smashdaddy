interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <img
      src="/images/logo.jpeg"
      alt="Smash Daddy"
      width={size}
      height={size}
      className={`rounded-full object-cover ring-2 ring-yellow-400 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
