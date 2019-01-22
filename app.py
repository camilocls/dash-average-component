import dash
import dash_average_component
from dash.dependencies import Input, Output
import dash_html_components as html
import orders

app = dash.Dash(__name__)

app.scripts.config.serve_locally = True
app.css.config.serve_locally = True

server = app.server

app.layout = html.Div([
    dash_average_component.DashAverage(
        id='dash-average',
        date='2018-05-18',
        period='day',
        data={
            "status": "Loading data...",
            "steps": {}
        }
    ),
    html.Div(id='output')
])

@app.callback(
    Output('dash-average', 'data'), 
    [
        Input('dash-average', 'date'), 
        Input('dash-average', 'period')
    ]
)
def update_figure(date, period):
    data = orders.orders_delivery_time(date, period, '576b0601bc47978b6c437637', 'all')
    return data

if __name__ == '__main__':
    app.run_server(debug=True)