import { setViewer } from "../js/setviewer.js";
import { constance } from "../js/const.js";
import { init_datetime } from "../js/init_draw_and_view.js"
import { check_datetime_from_input } from "../js/change_draw_and_view.js"

//const e = React.createElement;

function create_option(input_data) {
    var list = []
    const data = input_data
    for (var i in input_data) {
        list.push(<option key={i}>{data[i]}</option>);
    }

    return list
}

const _com = new constance()
const region = _com.region
const endpoint = _com.endpoint
const viewerIdArray = _com.viewerIdArray
AWS.config.region = region;
const s3 = new AWS.S3({ apiVersion: "2014-10-01", endpoint: new AWS.Endpoint(endpoint) });
const _propertyArray = _com.aipPropertyArray
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4ODliN2Q1NS1hYTkwLTQxYWQtOTVjMy01NzFlMGRkZThhYmEiLCJpZCI6Mzc1MjUsImlhdCI6MTYwNTE2MjMxNn0.NJ33oqQu8VeX6Yh55y4TiOCtFe5Cxfk6UbddVUorHWo';


class Init_comp extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            year: "",
            monthday: "",
            hourminute: "",
            viewerArray: [],
            imageryLayers: ""
        };
        this.input_year_data = [this.state.year]
        this.input_monthday_data = [this.state.monthday]
        this.input_hourminute_data = [this.state.hourminute]

        this.custom_render_loop = this.custom_render_loop.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.rend_flag = 0


    }

    async handleChange(event) {
        const type = event.target.id
        const val = event.target.value
        let param_dic_tmp = {
            "year": this.state.year,
            "monthday": this.state.monthday,
            "hourminute": this.state.hourminute
        }
        param_dic_tmp[type] = val
        console.log("check-bef", param_dic_tmp)
        const { param_dic, OptionDic } = await check_datetime_from_input(s3, param_dic_tmp)
        console.log("handle", param_dic, OptionDic)

        this.input_year_data = OptionDic["year"]
        this.input_monthday_data = OptionDic["monthday"]
        this.input_hourminute_data = OptionDic["hourminute"]

        this.setState({
            year: param_dic["year"],
            monthday: param_dic["monthday"],
            hourminute: param_dic["hourminute"]
        })

    }


    componentDidUpdate() {

        const Dom_param_dic = {
            year: this.state.year,
            monthday: this.state.monthday,
            hourminute: this.state.hourminute
        }
        console.log(Dom_param_dic)
        setViewer(this.state.imageryLayers, this.state.viewerArray, Dom_param_dic, _propertyArray, 0)

        for (let i = 0; i < viewerIdArray.length; i++) {
            this.state.viewerArray[i].scene.requestRender();
        };

        this.rend_flag = 0
        this.custom_render_loop()

    }


    custom_render_loop() {
        for (let i = 0; i < viewerIdArray.length; i++) {
            this.state.viewerArray[i].scene.requestRender();
        }

        if (this.rend_flag == 50) {
            return
        } else {
            this.rend_flag = this.rend_flag + 1
            window.requestAnimationFrame(this.custom_render_loop);
        }
    }



    async componentDidMount() {

        const { param_dic, OptionDic } = await init_datetime(s3)

        this.input_year_data = OptionDic["year"]
        this.input_monthday_data = OptionDic["monthday"]
        this.input_hourminute_data = OptionDic["hourminute"]

        let viewerArray = []
        viewerIdArray.forEach(viewerId => {

            const viewer = new Cesium.Viewer(viewerId, {
                requestRenderMode: true,
                maximumRenderTimeChange: 10,
                useDefaultRenderLoop: true
            })
            viewerArray.push(viewer);
        })

        const imageryLayers = viewerArray[0].imageryLayers
        this.setState({
            year: param_dic["year"],
            monthday: param_dic["monthday"],
            hourminute: param_dic["hourminute"],
            viewerArray: viewerArray,
            imageryLayers: imageryLayers
        });

    }


    render() {

        const year_list = create_option(this.input_year_data)
        const month_list = create_option(this.input_monthday_data)
        const hour_list = create_option(this.input_hourminute_data)

        let view_name_array = []

        for (let i = 0; i < 2; i++) {
            for (let j = 0; j < 3; j++) {
                const view_name = "viewer" + String(i + 1) + String(j + 1)
                view_name_array.push(view_name)
            }
        }



        return (
            <div>
                <div>
                    <select id="year" value={this.state.year} onChange={this.handleChange} key="year">
                        {year_list}
                    </select>
                    <select id="monthday" value={this.state.monthday} onChange={this.handleChange} key="monthday">
                        {month_list}
                    </select>
                    <select id="hourminute" value={this.state.hourminute} onChange={this.handleChange} key="hourminute">
                        {hour_list}
                    </select>
                </div>

                <table>
                    <tbody>
                        {view_name_array.map((v, id) => {
                            return <tr><td><div className="v" id={v}></div></td></tr>
                        })}
                    </tbody>
                </table>

                <div style={{ visibility: "hidden" }} id="controleViewer"></div>
                <div style={{ visibility: "hidden" }} id="c"></div>

            </div>
        );
    }
}


const domContainer = document.getElementById('app');
const figure = <Init_comp key="root" />
ReactDOM.render(figure, domContainer);



