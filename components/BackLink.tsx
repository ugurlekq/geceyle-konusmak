// components/BackLink.tsx
import Link from "next/link";

export default function BackLink({ href = "/", label = "← Geri Dön" }:{
    href?: string; label?: string;
}) {
    return (
        <div className="mt-10">
            <Link
                href={href}
                className="text-amber-400 hover:text-amber-300 underline-offset-4 hover:underline"
            >
                {label}
            </Link>
        </div>
    );
}
