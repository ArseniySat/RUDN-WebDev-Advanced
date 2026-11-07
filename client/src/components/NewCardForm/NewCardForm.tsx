import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCard } from "../../api/cards";
import styles from "./NewCardForm.module.css";

export function NewCardForm() {
  const [title, setTitle] = useState("");
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: createCard,
    onSuccess: () => {
      setTitle("");
      return queryClient.invalidateQueries({ queryKey: ["cards"] });
    },
  });

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault();
        const trimmedTitle = title.trim();
        if (!trimmedTitle || isPending) return;
        mutate(trimmedTitle);
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
