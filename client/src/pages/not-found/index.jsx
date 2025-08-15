import { Helmet } from "react-helmet";
function NotFound() {
  return <div>
    <Helmet>
      <title>404 Not Found - Shri Mahalaxmi Mobile</title>
      <meta name="description" content="The page you are looking for does not exist." />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    page doesn't exists
    </div>;
}

export default NotFound;
