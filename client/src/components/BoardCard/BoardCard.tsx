import styles from "./BoardCard.module.css";

type BoardCardProps = {
  title: string;
  isDone: boolean;
};

export function BoardCard({ title, isDone }: BoardCardProps) {
  return (
    <div className={isDone ? `${styles.card} ${styles.done}` : styles.card}>
      {title}
    </div>
  );
}