port module TransactionBox exposing (..)

import Browser
import Html exposing (..)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Json.Decode as D
import Json.Encode as E


port stateChanged : (E.Value -> msg) -> Sub msg


port event : () -> Cmd msg


type alias Model =
    { state : State
    , transactionList : List Transaction
    }


type alias Transaction =
    { id : String
    , itemName : String
    , amount : Int
    , price : Float
    }


initialModel : Model
initialModel =
    { state = Idle, transactionList = [] }


type State
    = Idle
    | Closed
    | Opened
    | Failed
    | End



{-
   {
       "value": "closed",
       "context": {
           "transactionList": [{
               "id": "BEST",
               "itemName": "Negaredama",
               "amount": 1,
               "price": 10.046
           }],
           "failedCount": 2
       }
   }
-}


modelDecoder : D.Decoder Model
modelDecoder =
    D.map2 Model stateDecoder transactionListDecoder


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


transactionListDecoder : D.Decoder (List Transaction)
transactionListDecoder =
    D.at [ "context", "transactionList" ] (D.list transactionDecoder)


transactionDecoder : D.Decoder Transaction
transactionDecoder =
    D.map4 Transaction (D.field "id" D.string) (D.field "itemName" D.string) (D.field "amount" D.int) (D.field "price" D.float)


type Msg
    = TransactionBoxClicked
    | StateChanged Model
    | DecodeStateError D.Error


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( { model | state = m.state, transactionList = m.transactionList }, Cmd.none )

        TransactionBoxClicked ->
            ( model, event () )

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
            , Attr.style "margin-top" "1rem"
            , Attr.style "color" "#FFF"
            , onClick TransactionBoxClicked
            ]
            [ text "Your Transaction" ]
        , div []
            (case model.state of
                Opened ->
                    [ div []
                        (List.map viewTransactionList model.transactionList)
                    ]

                _ ->
                    [ div [ Attr.style "display" "none" ] [] ]
            )
        ]


viewTransactionList : Transaction -> Html Msg
viewTransactionList transaction =
    div
        [ Attr.style "background" "#fad366"
        , Attr.style "padding" "0.5rem"
        , Attr.style "width" "15rem"
        , Attr.style "border-radius" "5px"
        ]
        [ span [ Attr.style "padding" "0.25rem" ] [ text transaction.id ]
        , span [ Attr.style "padding" "0.25rem" ] [ text transaction.itemName ]
        , span [ Attr.style "padding" "0.25rem" ] [ text (String.fromInt transaction.amount) ]
        , span [ Attr.style "padding" "0.25rem" ] [ text (String.fromFloat transaction.price) ]
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
