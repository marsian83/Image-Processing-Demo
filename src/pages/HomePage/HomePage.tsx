import { Link } from "react-router-dom";

const links = ["salt-pepper"];

export default function HomePage() {
  return (
    <>
      <article className="flex m-10 flex-wrap gap-x-2">
        {links.map((link, key) => (
          <Link
            to={link}
            key={key}
            className="bg-primary text-white px-5 py-2 rounded-md"
          >
            {link}
          </Link>
        ))}
      </article>
    </>
  );
}
