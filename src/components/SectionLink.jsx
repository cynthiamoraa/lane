import { Link, useLocation } from "react-router-dom";

// Link to a landing-page section ("#how-to-order"). On the home page it's a normal
// in-page anchor; elsewhere it routes to "/#how-to-order" and Home scrolls there.
export default function SectionLink({ href, ...props }) {
  const { pathname } = useLocation();
  if (pathname === "/") return <a href={href} {...props} />;
  return <Link to={href === "#top" ? "/" : `/${href}`} {...props} />;
}
