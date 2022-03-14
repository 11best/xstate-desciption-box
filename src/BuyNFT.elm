port module BuyNFT exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E


port stateChanged : (E.Value -> msg) -> Sub msg


port event : E.Value -> Cmd msg


type alias Model =
    { state : State
    , quantity : Int
    }


initialModel : Model
initialModel =
    { state = Idle, quantity = 1 }


type State
    = Idle
    | Pending
    | Complete
    | Error



{-
   {
       "value": "idle",
       "context": {
           "quantity": 2
       }
   }
-}


modelDecoder : D.Decoder Model
modelDecoder =
    D.map2 Model stateDecoder quantityDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "idle" ->
                        D.succeed Idle

                    "pending" ->
                        D.succeed Pending

                    "complete" ->
                        D.succeed Complete

                    "error" ->
                        D.succeed Error

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


quantityDecoder : D.Decoder Int
quantityDecoder =
    D.at [ "context", "quantity" ] D.int


type Msg
    = BuyButtonClicked
    | DecreaseClicked
    | IncreaseClicked
    | StateChanged Model
    | DecodeStateError D.Error


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( { model | state = m.state, quantity = m.quantity }, Cmd.none )

        DecreaseClicked ->
            ( model, event (E.string "decrease") )

        IncreaseClicked ->
            ( model, event (E.string "increase") )

        BuyButtonClicked ->
            ( model, event (E.string "buy") )

        DecodeStateError _ ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div [ Attr.style "margin-top" "1rem" ]
        [ div []
            [ button [ onClick DecreaseClicked ] [ text "-" ]
            , span [] [ text (String.fromInt model.quantity) ]
            , button [ onClick IncreaseClicked ] [ text "+" ]
            ]
        , buyButtonView
        , buyDetailView model.state

        -- , div []
        --     (case model.state of
        --         Idle ->
        --             [ div
        --                 []
        --                 []
        --             ]
        --         _ ->
        --             [ div [] [] ]
        --     )
        ]


buyButtonView : Html Msg
buyButtonView =
    div []
        [ button [ onClick BuyButtonClicked ] [ text "Buy now" ] ]


buyDetailView : State -> Html Msg
buyDetailView state =
    div []
        [ case state of
            Idle ->
                p [] [ text "Idle" ]

            Error ->
                p [] [ text "Error" ]

            Complete ->
                p [] [ text "Buy complete" ]

            _ ->
                p [] []
        ]


main : Program () Model Msg
main =
    Browser.element
        { init = \flags -> ( initialModel, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


subscriptions : Model -> Sub Msg
subscriptions _ =
    stateChanged
        (\value ->
            case D.decodeValue modelDecoder value of
                Ok m ->
                    StateChanged m

                Err e ->
                    DecodeStateError e
        )
