<script setup lang="ts">
import { useToggle } from "@vueuse/core";
import "uno.css";
import { onMessage } from "webext-bridge/content-script";
import { ref } from "vue";

const [show, toggle] = useToggle(false);
const lines = ref<string[]>([]);
const showButton = ref<boolean>(false);

onMessage("subtitle", ({ data }: { data: { lines: string[] } }) => {
  lines.value = data.lines;
  showButton.value = true;
});
</script>

<template>
  <div
    class="modal fade fixed top-10vh right-50px w-600px h-80vh outline-none overflow-x-hidden overflow-y-auto"
    tabindex="-1"
    :class="show ? '' : 'hidden'"
  >
    <div class="modal-dialog relative w-auto pointer-events-none">
      <div
        class="modal-content border-none shadow-lg relative flex flex-col w-full pointer-events-auto bg-white bg-clip-padding outline-none text-current"
      >
        <div class="modal-body relative p-4 text-black">
          <div
            v-for="line of lines"
            :key="line"
            class="p-1"
            v-html="line"
          ></div>
        </div>
      </div>
    </div>
  </div>
  <div :class="showButton ? '' : 'hidden'">
    <div
      class="fixed right-0 bottom-0 m-5 z-100 flex font-sans select-none leading-1em"
    >
      <div
        class="flex w-10 h-10 rounded-full shadow cursor-pointer"
        bg="teal-600 hover:teal-700"
        @click="toggle()"
      >
        <mdi-subtitles-outline class="block m-auto text-white text-lg" />
      </div>
    </div>
  </div>
</template>
