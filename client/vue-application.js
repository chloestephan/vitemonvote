const Home = window.httpVueLoader('./components/Home.vue')
const Login = window.httpVueLoader('./components/SeConnecter.vue')
const Admin = window.httpVueLoader('./components/Admin.vue')
const commentVoter = window.httpVueLoader('./components/CommentVoter.vue')

const AdminResultats = window.httpVueLoader('./components/admin/Resultats.vue')
const AdminAdmins = window.httpVueLoader('./components/admin/Admins.vue')
const AdminNouvelleElection = window.httpVueLoader('./components/admin/NouvelleElection.vue')
const AdminElections = window.httpVueLoader('./components/admin/Elections.vue')
const AdminElection = window.httpVueLoader('./components/admin/Election.vue')
const AdminElecteurs = window.httpVueLoader('./components/admin/Electeurs.vue')

const LoginResultats = window.httpVueLoader('./components/client/Resultats.vue')
const LoginVoirElection = window.httpVueLoader('./components/client/VoirElections.vue')
const LoginVoter = window.httpVueLoader('./components/client/Voter.vue')

const routes = [
  { path: '/', component: Home},
  { path: '/commentVoter', component: commentVoter},
  { path: '/user', component: Login,
    children: [
      {path: 'resultats', component: LoginResultats},
      {path: 'voirelections', component: LoginVoirElection},
      {path: 'voter', component: LoginVoter},
    ]
  },
  { path: '/admin', component: Admin,
    children: [
      {path: 'resultats', component: AdminResultats},
      {path: 'admins', component: AdminAdmins},
      {path: 'nouvelleelection', component: AdminNouvelleElection},
      {path: 'elections', component: AdminElections},
      {path: 'election/:id', component: AdminElection},
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
