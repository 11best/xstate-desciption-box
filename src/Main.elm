port module Main exposing (..)

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
    , detail : String
    }


initialModel : Model
initialModel =
    { state = Idle, detail = "" }


type State
    = Idle
    | Closed
    | Opened
    | Failed
    | End



{-
   {
       "value": "idle",
       "context": {
           "detail": "datadata",
           "failedCount": 2
       }
   }
-}


modelDecoder : D.Decoder Model
modelDecoder =
    D.map2 Model stateDecoder detailDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "idle" ->
                        D.succeed Idle

                    "closed" ->
                        D.succeed Closed

                    "opened" ->
                        D.succeed Opened

                    "failed" ->
                        D.succeed Failed

                    "end" ->
                        D.succeed End

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


detailDecoder : D.Decoder String
detailDecoder =
    D.at [ "context", "detail" ] D.string


type Msg
    = DescriptionBoxClicked
    | StateChanged Model
    | DecodeStateError D.Error


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( { model | state = m.state, detail = m.detail }, Cmd.none )

        DescriptionBoxClicked ->
            ( model, event (E.string "fffff") )

        DecodeStateError _ ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div []
        [ div
            [ Attr.style "border-radius" "5px"
            , Attr.style "background" "#eb8a83"
            , Attr.style "width" "15rem"
            , Attr.style "padding" "0.5rem"
            , Attr.style "cursor" "pointer"
            , onClick DescriptionBoxClicked
            ]
            [ text "Description" ]
        , div []
            [ case model.state of
                Opened ->
                    div
                        [ Attr.style "background" "#eb8a83"
                        , Attr.style "padding" "0.5rem"
                        , Attr.style "width" "15rem"
                        , Attr.style "border-radius" "5px"
                        ]
                        [ text model.detail ]

                _ ->
                    div [ Attr.style "display" "none" ] []
            ]
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
