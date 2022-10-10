import React, { useEffect, useState } from 'react';

// TODO: Add api
const _topics = ['clothes', 'vehicles'];

const delay = (amount: number): Promise<void> =>
  new Promise((res) => {
    setTimeout(() => {
      res();
    }, amount);
  });

const getTopics = async (): Promise<string[]> => {
  await delay(500);
  return _topics;
};

export const StartGameComponent = () => {
  const [topics, setTopics] = useState<string[]>([]);

  useEffect(() => {
    getTopics().then(setTopics);
  }, []);

  return (
    <>
      <h1>Start Hangman</h1>
      <h2>Please select a topic to start playing</h2>
      <ul>{topics.length > 0 && topics.map((t, i) => <li key={i}>{t}</li>)}</ul>
    </>
  );
};
