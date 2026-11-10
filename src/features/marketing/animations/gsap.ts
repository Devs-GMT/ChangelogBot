"use client";

import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { useGSAP } from "@gsap/react";

// Register once; importing this module anywhere on the client is enough.
gsap.registerPlugin(useGSAP, Flip, ScrollTrigger, TextPlugin);

export { gsap, Flip, ScrollTrigger, useGSAP };
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const FULL_MOTION = "(prefers-reduced-motion: no-preference)";
