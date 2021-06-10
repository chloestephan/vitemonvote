const Home = window.httpVueLoader('./components/Home.vue')
const Admin = window.httpVueLoader('./components/Admin.vue')
const Inscription = window.httpVueLoader('./components/Inscription.vue')

const AdminUtilisateurs = window.httpVueLoader('./components/admin/Utilisateurs.vue')
const AdminAdmins = window.httpVueLoader('./components/admin/Admins.vue')

const routes = [
  { path: '/', component: Home},
  { path: '/admin', component: Admin,
    children: [
      {path: 'utilisateurs', component: AdminUtilisateurs},
      {path: 'admins', component: AdminAdmins},
    ]
  },
  { path: '/inscription/maraude/:id', component: Inscription}
]

const router = new VueRouter({
  routes
})

var app = new Vue({
  router,
  el: '#app',
  data: {
    articles: [],
  },

  methods: {
  }
})
