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
    , totalWeight : Int
    , buy_order : List BuyOrder

    -- , whitelistData : Maybe Whitelist
    }


type alias BuyOrder =
    { nftName : String
    , quantity : Int
    }


type alias Whitelist =
    { project_id : String
    , round_id : String
    , wallet_address : String
    , total_quota : Int
    , remaining_quota : Int
    }


initialModel : Model
initialModel =
    { state = CheckWalletConnection
    , totalWeight = 0
    , buy_order = []
    }


type State
    = CheckWalletConnection
    | CheckWhitelist
    | CheckQuota
    | CanBuy
    | CannotBuy
    | Pending
    | Complete
    | Error



{-
   {
     "value": "idle",
     "context": {
         "totalWeight": 2,
         "whitelistData": {
            "project_id": "ampleia",
            "round_id": "presale-1",
            "wallet_address": "0x8b997752524D025c81D9bb5CB3D0Eb3D8a215c52",
            "total_quota": 10,
            "remaining_quota": 8,
            "meta": {
                "tier": "Mystic",
                "point": "60",
                "level": "2"
            }
         },
         buy_order: [{name: "silver", quantity: 1},{name: "gold", quantity: 0},{name: "platinum", quantity: 0}]
     }
   }
-}


modelDecoder : D.Decoder Model
modelDecoder =
    D.map3 Model stateDecoder totalWeightDecoder buyOrderDecoder


stateDecoder : D.Decoder State
stateDecoder =
    D.field "value" D.string
        |> D.andThen
            (\value ->
                case value of
                    "checkWalletConnection" ->
                        D.succeed CheckWalletConnection

                    "checkWhitelist" ->
                        D.succeed CheckWhitelist

                    "checkQuota" ->
                        D.succeed CheckQuota

                    "cannotBuy" ->
                        D.succeed CannotBuy

                    "canBuy" ->
                        D.succeed CanBuy

                    "pending" ->
                        D.succeed Pending

                    "complete" ->
                        D.succeed Complete

                    "error" ->
                        D.succeed Error

                    v ->
                        D.fail ("Unknown state: " ++ v)
            )


totalWeightDecoder : D.Decoder Int
totalWeightDecoder =
    D.at [ "context", "totalWeight" ] D.int


buyOrderDecoder : D.Decoder (List BuyOrder)
buyOrderDecoder =
    D.at [ "context", "buy_order" ] (D.list (D.map2 BuyOrder (D.field "nftName" D.string) (D.field "quantity" D.int)))



-- whitelistDecoder : D.Decoder Whitelist
-- whitelistDecoder =


type Msg
    = BuyButtonClicked
    | DecreaseClicked String
    | IncreaseClicked String
    | StateChanged Model
    | DecodeStateError D.Error


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        StateChanged m ->
            ( { model | state = m.state, totalWeight = m.totalWeight, buy_order = m.buy_order }, Cmd.none )

        DecreaseClicked nftName ->
            ( model
            , event
                (E.object
                    [ ( "action", E.string "decrease" )
                    , ( "nftName", E.string nftName )
                    ]
                )
            )

        IncreaseClicked nftName ->
            ( model
            , event
                (E.object
                    [ ( "action", E.string "increase" )
                    , ( "nftName", E.string nftName )
                    ]
                )
            )

        BuyButtonClicked ->
            ( model, event (E.string "buy") )

        DecodeStateError _ ->
            ( model, Cmd.none )


view : Model -> Html Msg
view model =
    div [ Attr.style "margin-top" "1rem" ]
        [ div [] (List.map quantityView model.buy_order)
        , buyButtonView model.state
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


quantityView : BuyOrder -> Html Msg
quantityView order =
    div []
        [ span [] [ text order.nftName ]
        , button [ onClick (DecreaseClicked order.nftName) ] [ text "-" ]
        , span [] [ text (String.fromInt order.quantity) ]
        , button [ onClick (IncreaseClicked order.nftName) ] [ text "+" ]
        ]


buyButtonView : State -> Html Msg
buyButtonView state =
    div []
        [ case state of
            CanBuy ->
                button [ onClick BuyButtonClicked ] [ text "Buy now" ]

            _ ->
                button [ Attr.disabled True ] [ text "Buy now" ]
        ]


buyDetailView : State -> Html Msg
buyDetailView state =
    div []
        [ case state of
            CheckWalletConnection ->
                p [] [ text "checking.." ]

            Error ->
                p [] [ text "Error" ]

            Complete ->
                p [] [ text "Buy complete" ]

            CannotBuy ->
                p [] [ text "You can not buy this NFT" ]

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
