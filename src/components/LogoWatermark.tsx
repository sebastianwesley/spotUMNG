import spotlightLogo from "@/assets/spotlight-logo-watermark.jpg";

interface LogoWatermarkProps {
  className?: string;
}

const LogoWatermark = ({ className = "" }: LogoWatermarkProps) => {
  return (
    <div 
      className={`pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <img
        src={spotlightLogo}
        alt=""
        className="w-[400px] md:w-[500px] lg:w-[600px] opacity-[0.03] select-none"
        style={{ filter: 'grayscale(100%)' }}
      />
    </div>
  );
};

export default LogoWatermark;
