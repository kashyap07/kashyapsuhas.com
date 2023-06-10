import { MaxWidthWrapper } from '@/components/Wrapper';
import Link from 'next/link';

export default function NotFound() {
  return (
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
            {`//`} Go <Link href="/">home!</Link>
          </code>
        </pre>
      </div>
    </MaxWidthWrapper>
  );
}
