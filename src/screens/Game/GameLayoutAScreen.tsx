import React from 'react';
import KenoGameLayout from './components/KenoGameLayout';
import StandardLotteryLayout from './components/StandardLotteryLayout';

export default function GameLayoutAScreen({ route, navigation }: any) {
  const { gameId } = route.params || {};
  const isKenoGame =
    gameId === 'keno' ||
    gameId === 'bao_keno' ||
    gameId === 'clln_keno' ||
    (typeof gameId === 'string' && gameId.includes('keno'));

  if (isKenoGame) {
    return <KenoGameLayout route={route} navigation={navigation} />;
  }
  return <StandardLotteryLayout route={route} navigation={navigation} />;
}
