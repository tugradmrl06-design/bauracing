"use client";

import { platformRepository } from "@/repositories/local-platform-repository";
import { useEffect, useState } from "react";
import type { PlatformData } from "@/types/platform";

export function usePlatformData() {
  const [data, setData] = useState<PlatformData>(() => platformRepository.getData());

  useEffect(() => {
    const refresh = () => setData(platformRepository.getData());
    refresh();
    window.addEventListener("bau-platform-data", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("bau-platform-data", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return {
    data,
    save: platformRepository.save.bind(platformRepository),
    createId: platformRepository.createId.bind(platformRepository),
    reset: platformRepository.reset.bind(platformRepository),
  };
}
