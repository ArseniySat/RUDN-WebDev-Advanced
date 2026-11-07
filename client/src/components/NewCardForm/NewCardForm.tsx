import { useState } from "react";
import styles from "./NewCardForm.module.css";

export function NewCardForm() {
  const [title, setTitle] = useState("");
  const isPending = false;

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle) return;
      }}
    >
      <input
        className={styles.input}
        placeholder="Название карточки"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        disabled={isPending}
      />
      <button
        className={styles.button}
        type="submit"
        disabled={isPending || !title.trim()}
      >
        Добавить
      </button>
    </form>
  );
}
