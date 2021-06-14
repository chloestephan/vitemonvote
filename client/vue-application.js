const Home = window.httpVueLoader('./components/Home.vue')
const Login = window.httpVueLoader('./components/SeConnecter.vue')
const Admin = window.httpVueLoader('./components/Admin.vue')

const AdminResultats = window.httpVueLoader('./components/admin/Resultats.vue')
const AdminAdmins = window.httpVueLoader('./components/admin/Admins.vue')
const AdminNouvelleElection = window.httpVueLoader('./components/admin/NouvelleElection.vue')

const routes = [
  { path: '/', component: Home},
  { path: '/user', component: Login},
  { path: '/admin', component: Admin,
    children: [
      {path: 'resultats', component: AdminResultats},
      {path: 'admins', component: AdminAdmins},
      {path: 'nouvelleelection', component: AdminNouvelleElection},
    ]
  },
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
