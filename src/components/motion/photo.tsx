"use client";

import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import type { Photo as PhotoData } from "@/config/photos";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * A photograph in a frame. It opens with a clip reveal when it enters the view and drifts
 * slightly against the scroll (not under reduced motion). The dominant colour fills the frame while the image loads.
 */
export function Photo({
  photo,
  className,
  sizes,
  priority = false,
  drift = 24,
  position = "center",
}: {
  photo: PhotoData;
  className?: string;
  sizes: string;
  priority?: boolean;
  drift?: number;
  position?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-drift, drift]);

  return (
    <motion.div
      ref={ref}
      className={cn("relative overflow-hidden rounded-[8px]", className)}
      style={{ backgroundColor: photo.color }}
      initial={{ clipPath: "inset(6% 6% 6% 6% round 8px)", opacity: 0.4 }}
      whileInView={{ clipPath: "inset(0% 0% 0% 0% round 8px)", opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.9, ease }}
    >
      <motion.div className="absolute -inset-y-8 inset-x-0 motion-reduce:!transform-none" style={{ y }}>
        <Image src={photo.src} alt={photo.alt} fill sizes={sizes} priority={priority} className="object-cover" style={{ objectPosition: position }} />
      </motion.div>
    </motion.div>
  );
}
