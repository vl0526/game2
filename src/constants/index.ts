

// Game Dimensions
export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

// Colors and Style
export const PRIMARY_COLOR = '#0048ab'; // Blueprint Blue
export const BACKGROUND_COLOR = '#f4f1de'; // Blueprint Paper
export const ROTTEN_EGG_COLOR = '#d92626'; // Warning Red
export const GOLDEN_EGG_COLOR = '#ffb833'; // Accent Yellow
export const BOMB_COLOR = '#333333'; // Dark Gray
export const HEART_COLOR = '#e53e3e'; // Red for heart
export const CLOCK_COLOR = '#3b82f6'; // Blue for clock
export const STAR_COLOR = '#ffde0a'; // Bright yellow for star
export const MAGNET_COLOR = '#9333ea'; // Purple for magnet
// FIX: Add FRENZY_COLOR constant.
export const FRENZY_COLOR = '#ff4500'; // OrangeRed for Frenzy
export const LINE_WIDTH = 5;

// Player settings
export const PLAYER_WIDTH = 80;
export const PLAYER_HEIGHT = 100;
export const PLAYER_SPEED = 500; // pixels per second
export const BASKET_OFFSET_Y = 60;
export const BASKET_WIDTH = 90;
export const BASKET_HEIGHT = 20;

// Falling Item settings
export const EGG_WIDTH = 30;
export const EGG_HEIGHT = 40;
export const BOMB_RADIUS = 20;
export const HEART_WIDTH = 35;
export const HEART_HEIGHT = 35;
export const CLOCK_RADIUS = 20;
export const STAR_WIDTH = 35;
export const STAR_HEIGHT = 35;
export const MAGNET_WIDTH = 40;
export const MAGNET_HEIGHT = 35;
// FIX: Add FRENZY item dimensions.
export const FRENZY_WIDTH = 30;
export const FRENZY_HEIGHT = 45;
export const INITIAL_EGG_SPEED = 120;
export const INITIAL_SPAWN_RATE = 1.1; // seconds

// Difficulty Scaling
export const DIFFICULTY_SCORE_INTERVAL = 100; // Increase difficulty every 100 points
export const SPEED_INCREASE_PER_INTERVAL = 25; // Speed increase
export const SPAWN_RATE_DECREASE_PER_INTERVAL = 0.05; // Spawn rate decrease
// FIX: Add MAX_DIFFICULTY_SCORE for older components.
export const MAX_DIFFICULTY_SCORE = 500;

// Power-up settings
export const SLOW_MOTION_DURATION = 5000; // 5 seconds in ms
export const SLOW_MOTION_FACTOR = 0.5;
export const MULTIPLIER_DURATION = 7000; // 7 seconds in ms
export const SCORE_MULTIPLIER = 2;
export const MAGNET_DURATION = 5000; // 5 seconds in ms
export const MAGNET_ATTRACTION_FORCE = 300; // How strongly items are pulled
// FIX: Add FRENZY_DURATION constant.
export const FRENZY_DURATION = 5000; // 5 seconds in ms

// Scoring
export const SCORE_NORMAL = 1;
export const SCORE_GOLDEN = 5;
export const COIN_CONVERSION_RATE = 10; // 1 coin for every 10 points

// Combo
export const COMBO_THRESHOLD = 5;
export const COMBO_DURATION = 5000; // 5 seconds in ms

// Leaderboard
export const LEADERBOARD_SIZE = 5;

// Inventory
export const INVENTORY_SIZE = 3;
