import Link from 'next/link';
import { FiGithub, FiMail, FiTwitter } from 'react-icons/fi';
import {
  FaTwitter,
  FaLinkedin,
  FaGithub,
  FaInstagram,
  FaYoutube,
  FaFacebook,
} from 'react-icons/fa';

const socialsObj = {
  twitter: {
    title: 'Twitter',
    icon: <FaTwitter />,
    icon2: <FiTwitter />,
    url: 'https://twitter.com/kashyapS07',
    color: '#1DA1F2',
    description:
      "I don't really use Twitter all that much, but this is probably the quickest way to get to me.",
  },
  linkedin: {
    title: 'LinkedIn',
    icon: <FaLinkedin />,
    url: 'https://www.linkedin.com/in/suhas-kashyap/',
    color: '#0077b5',
    description: 'I open this once a week. Tops.',
  },
  github: {
    title: 'Gtihub',
    icon: <FaGithub />,
    icon2: <FiGithub />,
    url: 'https://github.com/kashyap07',
    color: '#6cc644',
    description: "Please don't judge my garbage code :) Check footer for source of this website.",
  },
  instagram: {
    title: 'Instagram',
    icon: <FaInstagram />,
    url: 'https://www.instagram.com/kashyap_07',
    color: '#c72d8f',
    description: 'I use this quite often too, and my travel photos go here.',
  },
  youtube: {
    title: 'Youtube',
    icon: <FaYoutube />,
    url: 'https://www.youtube.com/c/SuhasKashyap07',
    color: '#ff0000',
    description: 'Will upload recipes here. In the future. Maybe.',
  },
  facebook: {
    title: 'Facebook',
    icon: <FaFacebook />,
    url: 'https://www.facebook.com/kashyapsuhas07',
    color: '#4267b2',
    description: "Linked and Shares insta content, haven't deleted yet.",
  },
  email: {
    title: 'Email',
    icon: <FiMail />,
    url: 'mailto:kashyapsuhas07@gmail.com',
    color: '#ffcc00',
    description: 'Second best way to contact me.',
  },
};

const { twitter, linkedin, github, instagram, youtube, facebook, email } = socialsObj;

// for preserving order
const socialsList = [twitter, linkedin, github, instagram, youtube, facebook, email];

const Socials = ({
  list = socialsList,
  className = 'gap-3 text-2xl',
  altIcons,
  withDescription,
}: {
  list?: any[];
  className?: string;
  altIcons?: any;
  withDescription?: any;
}) => {
  return (
    <div data-component="socials-wrapper" className={`flex ${className}`}>
      {list.map(social => (
        <div key={social.title}>
          {withDescription ? (
            <div className="flex w-full items-start px-2 py-3 md:items-center md:border-b md:px-4 md:py-5">
              <Link href={social.url}>
                <a
                  target="_blank"
                  className="social-icon fill-current  text-black"
                  // @ts-ignore
                  style={{ '--highlight-color': social.color }}
                >
                  {altIcons ? social.icon2 || social.icon : social.icon}
                </a>
              </Link>
              <span className="ml-4 text-lg">{social.description && social.description}</span>
            </div>
          ) : (
            <Link href={social.url}>
              <a
                target="_blank"
                className="social-icon fill-current  text-black"
                // @ts-ignore
                style={{ '--highlight-color': social.color }}
              >
                {altIcons ? social.icon2 || social.icon : social.icon}
              </a>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
};

export { socialsObj, Socials };
