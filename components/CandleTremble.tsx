import type { ReactNode, ElementType } from "react";

type Props = {
    as?: ElementType;
    className?: string;
    children: ReactNode;
};

// Başlık/metin için hafif “mum titremesi”
export default function CandleTremble({ as: Tag = "div", className = "", children }: Props) {
    const Comp = Tag as ElementType;
    return <Comp className={`candle-flicker ${className}`}>{children}</Comp>;
}
