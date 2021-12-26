import classNames from 'classnames';
import styles from './card.module.less';

export const Card: React.FC<{
  id?: string;
  flex?: boolean;
}> = ({ id, flex, children }) => {
  return (
    <div
      id={id}
      className={classNames(styles.card, { [styles['card-flex']]: flex })}>
      {children}
    </div>
  );
};
