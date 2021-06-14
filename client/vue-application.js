const Home = window.httpVueLoader('./components/Home.vue')
const Admin = window.httpVueLoader('./components/Admin.vue')
const Inscription = window.httpVueLoader('./components/Inscription.vue')

const AdminResultats = window.httpVueLoader('./components/admin/Resultats.vue')
const AdminAdmins = window.httpVueLoader('./components/admin/Admins.vue')
const AdminNouvelleElection = window.httpVueLoader('./components/admin/NouvelleElection.vue')

const routes = [
  { path: '/', component: Home},
  { path: '/admin', component: Admin,
    children: [
      {path: 'resultats', component: AdminResultats},
      {path: 'admins', component: AdminAdmins},
      {path: 'nouvelleelection', component: AdminNouvelleElection},
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
