<template>
  <div>
      <h2>Veillez sélectionner une élection afin d'afficher ses résultats.</h2>
      <hr>
  </div>
</template>


<script>
module.exports = {
}
</script>

<style scoped>
.user{
    background-color: rgb(248, 248, 248);
    border-radius: 10px;
    width: 480px;
    margin: auto;
    padding: 20px;
    margin-top: 20px;
    margin-bottom: 20px;
}

.user h3 {
    text-align: center;
}

.user p {
    margin-top: 5px;
    margin-bottom: 5px;
}

.user p span {
    text-decoration: underline;
}

.delete {
    text-align: center;
    color: grey;
}

.delete:hover{
    cursor: pointer;
    text-decoration: underline;
}

h2 {
  font-family: 'open sans', 'HelveticaNeue', 'Helvetica Neue', 'Helvetica-Neue', Helvetica, Arial, sans-serif;
  font-size: 28px;
  line-height: 1.1em;
  margin-bottom: 10px;
  display: block;
  font-size: 1.5em;
  margin-block-start: 0.83em;
  margin-block-end: 0.83em;
  margin-inline-start: 0px;
  margin-inline-end: 0px;
  text-align: center;
  text-transform: uppercase;
  color: #fff;
}

hr {
  display: block;
  border: 0;
  border-radius: 3em;
  border-top: 2px solid orange;
  margin-top: 10px;
  margin-bottom: 10px;
  width: 10%;
  margin: auto;
}

ul {
    margin-left: 20px;
}
</style>