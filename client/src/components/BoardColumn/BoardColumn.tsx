import { BoardCard } from "../BoardCard/BoardCard";
import styles from "./BoardColumn.module.css";
import type { Card } from "../../types/card";

type BoardColumnProps = {
  cards: Card[];
};

export function BoardColumn(_props: BoardColumnProps) {
  return (
    <section className={styles.column}>
      <h2 className={styles.title}>К выполнению</h2>
      <div className={styles.cards}>
        <BoardCard title="Изучить материалы Темы 1" />
        <BoardCard title="Выполнить задания семинара" />
      </div>
    </section>
  );
}
