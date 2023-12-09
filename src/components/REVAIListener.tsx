"use client";

import { useEffect } from "react";

interface Props {
  readURL: string;
}

function REVAIListener({ readURL }: Props) {
  console.log({ readURL });

  useEffect(() => {
    const ws = new WebSocket(readURL);
  }, []);

  return null;
}

export default REVAIListener;
