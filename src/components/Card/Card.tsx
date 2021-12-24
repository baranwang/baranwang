import classNames from "classnames";
import styles from "./card.module.less";

export const Card: React.FC<{
  flex?: boolean;
}> = ({ children, flex }) => {
  return (
    <div className={classNames(styles.card, { [styles["card-flex"]]: flex })}>
      {children}
    </div>
  );
};
