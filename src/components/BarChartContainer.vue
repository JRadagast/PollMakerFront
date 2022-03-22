<template>
    <div class="content" v-if="loaded">
        <apex-chart width="960" height="700" type="bar" :options="options" :series="series"></apex-chart>
    </div>
</template>

<script>

export default {
    name: 'BarChartContainer',
    components: {  

    },
    props: {
            idpoll: null
    },
    data: () => ({
        loaded: false,
        options: {
            plotOptions: {
                bar: {
                    horizontal: true,
                },
            },
            xaxis: {
                categories: []
            }
        },
        series: [{ 
            name: 'Opções',
            data: [],
        }]
    }),
    computed: {
    },
    mounted () {
        this.loaded = false

        if (this.idpoll > 0){
            this.axios.get('http://localhost:8080/pollmaker/answers/answersfrompoll?idpoll='+this.idpoll)
                .then( x =>{
                    this.series = [{
                        data: x.data.map( x => {
                            return x.value;
                        })
                    }]
                    this.options.xaxis.categories = x.data.map( x => {
                        return x.label;
                    });
                    
                    this.loaded = true;
                })
                .catch( ex => {
                    console.log(ex);
                });
        }
    },
    methods: {
    }
}
</script>

<style >
    #horizontalbar-chart{
        height: 700px !important; 
    }
</style>