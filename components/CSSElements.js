import styles from "../styles/CSSElements.module.css";

const ScrollDownIndicator = () => (
  <div className="flex h-20 w-full items-center justify-center absolute bottom-6">
    <div className={styles["chevron"]}></div>
    <div className={styles["chevron"]}></div>
    <div className={styles["chevron"]}></div>
  </div>
);

export { ScrollDownIndicator };
