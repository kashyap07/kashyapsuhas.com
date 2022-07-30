import clsx from 'clsx';
import Link from 'next/link';
import MaxWidthWrapper from '../components/MaxWidthWrapper';
import SideTitle from '../components/SideTitle';

const NotFound = ({ className }: { className?: string }) => {
  return (
    <main className={clsx(className, 'relative md:mt-6')}>
      <SideTitle>404</SideTitle>

      <MaxWidthWrapper>
        {/* idea from https://codepen.io/tsotsoblotso/pen/mVMvVv */}
        <div className="mockup-code my-14 rounded-lg sm:w-1/2">
          <pre data-prefix="1">
            <code>{`// 404 page not found.`}</code>
          </pre>
          <pre data-prefix="2">
            <code>{`if (!found) {`}</code>
          </pre>
          <pre data-prefix="3">
            <code>{`    throw ("(╯°□°)╯︵ ┻━┻");`}</code>
          </pre>
          <pre data-prefix="4">
            <code>{`}`}</code>
          </pre>
          <pre data-prefix="5">
            <code>
              {`//`} Go{' '}
              <Link href="/">
                <a>home!</a>
              </Link>
            </code>
          </pre>
        </div>
      </MaxWidthWrapper>
    </main>
  );
};

export default NotFound;
