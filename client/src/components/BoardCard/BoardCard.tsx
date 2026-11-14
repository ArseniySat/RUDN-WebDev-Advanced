import styles from "./BoardCard.module.css";

type BoardCardProps = {
  id: string;
  title: string;
  isDone: boolean;
  onDelete: (id: string) => void;
};

export function BoardCard({ id, title, isDone, onDelete }: BoardCardProps) {
  return (
    <div className={isDone ? styles.isDone : styles.card}>
      <span className={styles.title}>{title}</span>
      <button
        className={styles.deleteButton}
        onClick={() => onDelete(id)}
        type="button"
        aria-label="Удалить карточку"
      >
        ✕
      </button>
    </div>
  );
}
