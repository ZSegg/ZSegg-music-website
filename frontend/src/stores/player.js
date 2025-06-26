import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { updatePlayCount } from "../api/music";

export const usePlayerStore = defineStore(
  "player",
  () => {
    const currentSong = ref(null);
    const playlist = ref([]);
    const currentIndex = ref(-1);
    const isPlaying = ref(false);
    const volume = ref(0.7);
    const duration = ref(0);
    const currentTime = ref(0);

    const hasNext = computed(
      () => currentIndex.value < playlist.value.length - 1
    );
    const hasPrev = computed(() => currentIndex.value > 0);

    const setCurrentSong = (song) => {
      currentSong.value = song;
    };

    const setPlaylist = (songs) => {
      playlist.value = songs;
    };

    const play = async (song, index = -1) => {
      if (index >= 0) {
        currentIndex.value = index;
        currentSong.value = playlist.value[index];
      } else {
        currentSong.value = song;
        if (!playlist.value.find((s) => s.id === song.id)) {
          playlist.value.push(song);
          currentIndex.value = playlist.value.length - 1;
        } else {
          currentIndex.value = playlist.value.findIndex(
            (s) => s.id === song.id
          );
        }
      }

      // 更新播放次数
      if (song && song.id) {
        try {
          await updatePlayCount(song.id);
          // 更新本地播放次数
          if (song.hot !== undefined) {
            song.hot = (song.hot || 0) + 1;
          }
          // 同时更新播放列表中的播放次数
          const playlistSong = playlist.value.find((s) => s.id === song.id);
          if (playlistSong && playlistSong.hot !== undefined) {
            playlistSong.hot = (playlistSong.hot || 0) + 1;
          }
        } catch (error) {
          console.error("更新播放次数失败:", error);
        }
      }

      isPlaying.value = true;
    };

    const pause = () => {
      isPlaying.value = false;
    };

    const resume = () => {
      isPlaying.value = true;
    };

    const next = () => {
      if (hasNext.value) {
        currentIndex.value++;
        currentSong.value = playlist.value[currentIndex.value];
      }
    };

    const prev = () => {
      if (hasPrev.value) {
        currentIndex.value--;
        currentSong.value = playlist.value[currentIndex.value];
      }
    };

    const setVolume = (vol) => {
      volume.value = Math.max(0, Math.min(1, vol));
    };

    const setDuration = (dur) => {
      duration.value = dur;
    };

    const setCurrentTime = (time) => {
      currentTime.value = time;
    };

    const clearPlaylist = () => {
      playlist.value = [];
      currentIndex.value = -1;
      currentSong.value = null;
      isPlaying.value = false;
    };

    return {
      currentSong,
      playlist,
      currentIndex,
      isPlaying,
      volume,
      duration,
      currentTime,
      hasNext,
      hasPrev,
      setCurrentSong,
      setPlaylist,
      play,
      pause,
      resume,
      next,
      prev,
      setVolume,
      setDuration,
      setCurrentTime,
      clearPlaylist,
    };
  },
  {
    persist: true,
  }
);
