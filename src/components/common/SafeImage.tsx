// مسیر فایل: doctime-frontend/src/components/common/SafeImage.tsx

import React, { useState, useEffect } from "react";

type SafeImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackSrc?: string;
  textFallback?: string; // برای نمایش حروف اختصاری در صورت نبود عکس
};

const SafeImage: React.FC<SafeImageProps> = ({
  src,
  fallbackSrc = "/images/fallback-doctor.jpg", // عکس لوکال پیش‌فرض در پوشه public
  alt,
  textFallback,
  className,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState<boolean>(false);

  // اگر مقدار src از بیرون تغییر کرد، استیت را بروزرسانی کن
  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // اگر عکس کلاً لود نشد و متن جایگزین داشتیم، یک آواتار متنی شیک بساز
  if (hasError && textFallback) {
    const initials = textFallback.trim().substring(0, 2);
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-800 font-black text-lg rounded-full shadow-inner ${className}`}
        style={{ width: props.width, height: props.height }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      {...props}
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
};

export default SafeImage;
