import Link from "next/link";
import { FiTwitter, FiGithub, FiMail } from "react-icons/fi";
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaFacebook,
} from "react-icons/fa";

const socialsObj = {
  twitter: {
    title: "Twitter",
    icon: <FaTwitter />,
    icon2: <FiTwitter />,
    url: "https://twitter.com/kashyapS07",
    color: "#1DA1F2",
  },
  linkedin: {
    title: "LinkedIn",
    icon: <FaLinkedin />,
    url: "https://www.linkedin.com/in/suhas-kashyap/",
    color: "#0077b5",
  },
  github: {
    title: "Gtihub",
    icon: <FaGithub />,
    icon2: <FiGithub />,
    url: "https://github.com/kashyap07",
    color: "#6cc644",
  },
  instagram: {
    title: "Instagram",
    icon: <FaInstagram />,
    url: "https://www.instagram.com/kashyap_07",
    color: "#c72d8f",
  },
  youtube: {
    title: "Youtube",
    icon: <FaYoutube />,
    url: "https://www.youtube.com/c/SuhasKashyap07",
    color: "#ff0000",
  },
  facebook: {
    title: "Facebook",
    icon: <FaFacebook />,
    url: "https://www.facebook.com/kashyapsuhas07",
    color: "#4267b2",
  },
  email: {
    title: "Email",
    icon: <FiMail />,
    url: "mailto:kashyapsuhas07@gmail.com",
    color: "#ffcc00",
  },
};

const {
  twitter,
  linkedin,
  github,
  instagram,
  youtube,
  facebook,
  email,
} = socialsObj;

// for preserving order
const socialsList = [
  twitter,
  linkedin,
  github,
  instagram,
  youtube,
  facebook,
  email,
];

const Socials = ({
  list = socialsList,
  className = "text-2xl gap-3",
  altIcons,
}) => {
  return (
    <div data-component="socials-wrapper" className={`flex ${className}`}>
      {list.map((social) => {
        console.log(social);
        return (
          <Link key={social.title} href={social.url} passHref>
            <a
              target="_blank"
              className="fill-current text-gray-700 social-icon"
              style={{ "--highlight-color": social.color }}
            >
              {altIcons ? social.icon2 || social.icon : social.icon}
            </a>
          </Link>
        );
      })}
    </div>
  );
};

export { socialsObj, Socials };
