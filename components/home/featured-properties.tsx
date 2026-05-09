"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { PropertyCard } from "@/components/home/property-card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FEATURED_PROPERTIES } from "@/lib/mock-data";

export function FeaturedProperties() {
  return (
    <section id="featured" className="bg-background py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-6"
        >
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
              Featured
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              Hand-picked homes you&apos;ll want to tour
            </h2>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Match scores reflect lifestyle fit, commute, and budget — not just keywords.
            </p>
          </div>
          <Button asChild variant="ghost" className="hidden shrink-0 sm:inline-flex">
            <Link href="/buy">
              View all
              <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-10"
        >
          <Carousel
            opts={{ align: "start", loop: false }}
            className="relative"
          >
            <CarouselContent className="-ml-4">
              {FEATURED_PROPERTIES.map((property) => (
                <CarouselItem
                  key={property.id}
                  className="basis-[85%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
                >
                  <PropertyCard property={property} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden lg:-left-6 lg:flex" />
            <CarouselNext className="hidden lg:-right-6 lg:flex" />
          </Carousel>
        </motion.div>
      </div>
    </section>
  );
}
