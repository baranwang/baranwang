import { useEffect, useRef, useState } from "react";

export const Image: React.FC<{
  src: string;
}> = ({ src }) => {
  const ref = useRef<HTMLPictureElement>(null);

  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    if (!ref.current) return;
    let observer: IntersectionObserver;
    if (!("IntersectionObserver" in window)) {
      setImageSrc(src);
    } else {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.intersectionRatio >= 0.2) {
              setImageSrc(src);
              observer.disconnect();
            }
          });
        },
        {
          threshold: [0.2, 1],
        }
      );
      observer.observe(ref.current);
    }
    return () => {
      observer?.disconnect();
    };
  }, [src, ref]);

  return (
    <picture ref={ref}>
      {!!imageSrc && (
        <>
          <source
            srcSet={`${imageSrc}?imageMogr2/format/webp/ignore-error/1`}
            type="image/webp"
          />
          <img src={imageSrc} />
        </>
      )}
    </picture>
  );
};
