/**
 * PlayerIdentity.js - Manages active player nickname, selected merchant character, and identity state
 */

import charactersData from '../../data/characters.json';

const NICKNAME_KEY = 'vyapar_player_nickname';
const CHARACTER_KEY = 'vyapar_player_character';
const listeners = new Set();

function readStoredNickname() {
  if (typeof window === 'undefined') return '';
  return (localStorage.getItem(NICKNAME_KEY) || '').trim();
}

function readStoredCharacter() {
  if (typeof window === 'undefined') return 'merchant_male';
  return (localStorage.getItem(CHARACTER_KEY) || 'merchant_male').trim();
}

let nickname = readStoredNickname();
let selectedCharacter = readStoredCharacter();

export function getPlayerNickname() {
  return nickname;
}

export function setPlayerNickname(value) {
  nickname = (value || '').trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem(NICKNAME_KEY, nickname);
  }
  notifyListeners();
}

export function clearPlayerNickname() {
  nickname = '';
  if (typeof window !== 'undefined') {
    localStorage.removeItem(NICKNAME_KEY);
  }
  notifyListeners();
}

export function getPlayerCharacter() {
  return selectedCharacter || 'merchant_male';
}

export function setPlayerCharacter(charId) {
  selectedCharacter = (charId || 'merchant_male').trim();
  if (typeof window !== 'undefined') {
    localStorage.setItem(CHARACTER_KEY, selectedCharacter);
  }
  notifyListeners();
}

export function clearPlayerCharacter() {
  selectedCharacter = 'merchant_male';
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CHARACTER_KEY);
  }
  notifyListeners();
}

export function getCharacterDetails(charId = null) {
  const id = charId || getPlayerCharacter();
  return charactersData.find(c => c.id === id) || charactersData[0];
}

export function getAllCharacters() {
  return charactersData;
}

function notifyListeners() {
  listeners.forEach(listener => listener({
    nickname,
    selectedCharacter,
    characterDetails: getCharacterDetails(selectedCharacter)
  }));
}

export function subscribePlayerIdentity(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export { NICKNAME_KEY, CHARACTER_KEY };
