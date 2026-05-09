"use client";

import { motion } from "framer-motion";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { HomePropertyCard } from "@/components/home/home-property-card";

export type FeaturedProperty = {
  id: string;
  title: string;
  price: number;
  priceType: string;
  city: string;
  locality: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  areaUnit: string;
  coverUrl: string | null;
  verified: boolean;
  featured: boolean;
  matchScore: number;
};

type Props = { properties: FeaturedProperty[] };

export function FeaturedPropertiesCarousel({ properties }: Props) {
  if (properties.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No properties listed yet.{" "}
        <a href="/post-property" className="text-emerald-600 underline">
          Be the first to post one!
        </a>
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5 }}
    >
      <Carousel opts={{ align: "start", loop: false }} className="relative">
        <CarouselContent className="-ml-4">
          {properties.map((p) => (
            <CarouselItem
              key={p.id}
              className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
            >
              <HomePropertyCard property={p} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden lg:-left-6 lg:flex" />
        <CarouselNext className="hidden lg:-right-6 lg:flex" />
      </Carousel>
    </motion.div>
  );
}
