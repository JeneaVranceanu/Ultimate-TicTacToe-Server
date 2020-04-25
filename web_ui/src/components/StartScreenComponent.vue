<template>
  <div id="start-screen" class="container">
    <br />
    <div class="row">
      <div class="form">
        <input
          v-model="name"
          id="name"
          name="name"
          type="text"
          autocomplete="off"
          maxlength="15"
          required
        />
        <label for="name" class="label-name">
          <span class="content-name">Name</span>
        </label>
      </div>
    </div>
    <div class="row">
      <button
        @click="register"
        id="enter"
        class="action-button btn btn-primary"
        type="button"
      >Enter</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import router from '../../src/router';

@Component
export default class StartScreenComponent extends Vue {
  
  name = '';
  
  register(): void {
    window.alert(`Nice to meet you, ${this.name}!`);
    this.$router.push('./main');
  }
}
</script>