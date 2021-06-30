const Home = window.httpVueLoader('./components/Home.vue')
const Login = window.httpVueLoader('./components/SeConnecter.vue')
const Resultats = window.httpVueLoader('./components/Resultats.vue')
const Admin = window.httpVueLoader('./components/Admin.vue')
const commentVoter = window.httpVueLoader('./components/CommentVoter.vue')

const AdminAdmins = window.httpVueLoader('./components/admin/Admins.vue')
const AdminNouvelleElection = window.httpVueLoader('./components/admin/NouvelleElection.vue')
const AdminElections = window.httpVueLoader('./components/admin/Elections.vue')
const AdminElecteurs = window.httpVueLoader('./components/admin/Electeurs.vue')

const LoginElection = window.httpVueLoader('./components/client/Elections.vue')
const resultatsElection = window.httpVueLoader('./components/client/Resultats.vue')

const routes = [
  { path: '/', component: Home},
  { path: '/commentVoter', component: commentVoter},
  { path: '/resultats', component: Resultats},
  { path: '/user', component: Login,
    children: [
      {path: 'elections', component: LoginElection},
    ]
  },
  { path: '/resultats', component: resultatsElection },
  { path: '/admin', component: Admin,
    children: [
      {path: 'admins', component: AdminAdmins},
      {path: 'nouvelleelection', component: AdminNouvelleElection},
      {path: 'elections', component: AdminElections},
      {path: 'electeurs', component: AdminElecteurs},
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
