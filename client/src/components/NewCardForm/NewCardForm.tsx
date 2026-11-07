import { useState } from "react";
import styles from "./NewCardForm.module.css";

export function NewCardForm() {
  const [title, setTitle] = useState("");

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <input
        className={styles.input}
        placeholder="Название карточки"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <button className={styles.button} type="submit">
        Добавить
      </button>
    </form>
  );
}
