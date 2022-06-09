import './index.css';
import { createApp } from 'vue';
import { createPinia } from '@/store';
import App from './App.vue';
import VueClickAway from 'vue3-click-away';
import axios from 'axios';
import { router } from '@/router/index';
// import VueSocketIOExt from 'vue-socket.io-extended';
// import { io } from 'socket.io-client';

// const socket = io('http://localhost:3000');

const pinia = createPinia();

createApp(App).use(pinia).use(VueClickAway).use(router).mount('#app');
// .use(VueSocketIOExt, socket);

// make axios available to the whole app by accessing this.axios
// app.config.globalProperties.axios = axios;


