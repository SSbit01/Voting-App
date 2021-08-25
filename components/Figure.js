import Link from "next/link";

export default function Figure({img, name}) {
  return (
    <Link href={`/user/${name}`} passHref={true}>
      <figure className="flex items-center gap-3 cursor-pointer">
        <img src={img} width="64" height="64" alt="profile img" className="rounded-full shadow-2xl"/>
        <figcaption className="text-2xl shadow-2xl">{name}</figcaption>
      </figure>
    </Link>
  );
}