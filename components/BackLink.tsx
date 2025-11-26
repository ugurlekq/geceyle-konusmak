// components/BackLink.tsx
import Link from 'next/link';

type Props = {
    href: string;
    label?: string;
    className?: string;
};

export default function BackLink({ href, label = '← Geri', className = '' }: Props) {
    return (
        <Link
            href={href}
            className={
                'inline-flex items-center text-amber-300 hover:text-amber-200 hover:underline ' +
                'transition ' +
                className
            }
        >
            {label}
        </Link>
    );
}
