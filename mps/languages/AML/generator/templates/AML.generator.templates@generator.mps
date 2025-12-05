<?xml version="1.0" encoding="UTF-8"?>
<model ref="r:8d8dc333-29e4-4ab6-b0af-3e3a73510677(AML.generator.templates@generator)">
  <persistence version="9" />
  <languages>
    <use id="f2801650-65d5-424e-bb1b-463a8781b786" name="jetbrains.mps.baseLanguage.javadoc" version="2" />
    <use id="b401a680-8325-4110-8fd3-84331ff25bef" name="jetbrains.mps.lang.generator" version="4" />
    <devkit ref="a2eb3a43-fcc2-4200-80dc-c60110c4862d(jetbrains.mps.devkit.templates)" />
  </languages>
  <imports>
    <import index="htms" ref="r:8f6b9f4d-1e5b-4c8f-a071-dbe1371a4767(AML.structure)" implicit="true" />
    <import index="wyt6" ref="6354ebe7-c22a-4a0f-ac54-50b52ab9b065/java:java.lang(JDK/)" implicit="true" />
    <import index="guwi" ref="6354ebe7-c22a-4a0f-ac54-50b52ab9b065/java:java.io(JDK/)" implicit="true" />
  </imports>
  <registry>
    <language id="f3061a53-9226-4cc5-a443-f952ceaf5816" name="jetbrains.mps.baseLanguage">
      <concept id="1082485599095" name="jetbrains.mps.baseLanguage.structure.BlockStatement" flags="nn" index="9aQIb">
        <child id="1082485599096" name="statements" index="9aQI4" />
      </concept>
      <concept id="1202948039474" name="jetbrains.mps.baseLanguage.structure.InstanceMethodCallOperation" flags="nn" index="liA8E" />
      <concept id="1197027756228" name="jetbrains.mps.baseLanguage.structure.DotExpression" flags="nn" index="2OqwBi">
        <child id="1197027771414" name="operand" index="2Oq$k0" />
        <child id="1197027833540" name="operation" index="2OqNvi" />
      </concept>
      <concept id="1137021947720" name="jetbrains.mps.baseLanguage.structure.ConceptFunction" flags="in" index="2VMwT0">
        <child id="1137022507850" name="body" index="2VODD2" />
      </concept>
      <concept id="1070475926800" name="jetbrains.mps.baseLanguage.structure.StringLiteral" flags="nn" index="Xl_RD">
        <property id="1070475926801" name="value" index="Xl_RC" />
      </concept>
      <concept id="1081236700938" name="jetbrains.mps.baseLanguage.structure.StaticMethodDeclaration" flags="ig" index="2YIFZL" />
      <concept id="1070533707846" name="jetbrains.mps.baseLanguage.structure.StaticFieldReference" flags="nn" index="10M0yZ">
        <reference id="1144433057691" name="classifier" index="1PxDUh" />
      </concept>
      <concept id="1070534760951" name="jetbrains.mps.baseLanguage.structure.ArrayType" flags="in" index="10Q1$e">
        <child id="1070534760952" name="componentType" index="10Q1$1" />
      </concept>
      <concept id="1068390468198" name="jetbrains.mps.baseLanguage.structure.ClassConcept" flags="ig" index="312cEu" />
      <concept id="1068498886296" name="jetbrains.mps.baseLanguage.structure.VariableReference" flags="nn" index="37vLTw">
        <reference id="1068581517664" name="variableDeclaration" index="3cqZAo" />
      </concept>
      <concept id="1068498886292" name="jetbrains.mps.baseLanguage.structure.ParameterDeclaration" flags="ir" index="37vLTG" />
      <concept id="1225271177708" name="jetbrains.mps.baseLanguage.structure.StringType" flags="in" index="17QB3L" />
      <concept id="4972933694980447171" name="jetbrains.mps.baseLanguage.structure.BaseVariableDeclaration" flags="ng" index="19Szcq">
        <child id="5680397130376446158" name="type" index="1tU5fm" />
      </concept>
      <concept id="1068580123132" name="jetbrains.mps.baseLanguage.structure.BaseMethodDeclaration" flags="ng" index="3clF44">
        <child id="1068580123133" name="returnType" index="3clF45" />
        <child id="1068580123134" name="parameter" index="3clF46" />
        <child id="1068580123135" name="body" index="3clF47" />
      </concept>
      <concept id="1068580123155" name="jetbrains.mps.baseLanguage.structure.ExpressionStatement" flags="nn" index="3clFbF">
        <child id="1068580123156" name="expression" index="3clFbG" />
      </concept>
      <concept id="1068580123157" name="jetbrains.mps.baseLanguage.structure.Statement" flags="nn" index="3clFbH" />
      <concept id="1068580123136" name="jetbrains.mps.baseLanguage.structure.StatementList" flags="sn" stub="5293379017992965193" index="3clFbS">
        <child id="1068581517665" name="statement" index="3cqZAp" />
      </concept>
      <concept id="1068580320020" name="jetbrains.mps.baseLanguage.structure.IntegerConstant" flags="nn" index="3cmrfG">
        <property id="1068580320021" name="value" index="3cmrfH" />
      </concept>
      <concept id="1068581242875" name="jetbrains.mps.baseLanguage.structure.PlusExpression" flags="nn" index="3cpWs3" />
      <concept id="1068581517677" name="jetbrains.mps.baseLanguage.structure.VoidType" flags="in" index="3cqZAl" />
      <concept id="1204053956946" name="jetbrains.mps.baseLanguage.structure.IMethodCall" flags="ngI" index="1ndlxa">
        <reference id="1068499141037" name="baseMethodDeclaration" index="37wK5l" />
        <child id="1068499141038" name="actualArgument" index="37wK5m" />
      </concept>
      <concept id="1107461130800" name="jetbrains.mps.baseLanguage.structure.Classifier" flags="ng" index="3pOWGL">
        <child id="5375687026011219971" name="member" index="jymVt" unordered="true" />
      </concept>
      <concept id="1081773326031" name="jetbrains.mps.baseLanguage.structure.BinaryOperation" flags="nn" index="3uHJSO">
        <child id="1081773367579" name="rightExpression" index="3uHU7w" />
        <child id="1081773367580" name="leftExpression" index="3uHU7B" />
      </concept>
      <concept id="1178549954367" name="jetbrains.mps.baseLanguage.structure.IVisible" flags="ngI" index="1B3ioH">
        <child id="1178549979242" name="visibility" index="1B3o_S" />
      </concept>
      <concept id="1146644602865" name="jetbrains.mps.baseLanguage.structure.PublicVisibility" flags="nn" index="3Tm1VV" />
    </language>
    <language id="b401a680-8325-4110-8fd3-84331ff25bef" name="jetbrains.mps.lang.generator">
      <concept id="1114729360583" name="jetbrains.mps.lang.generator.structure.CopySrcListMacro" flags="ln" index="2b32R4">
        <child id="1168278589236" name="sourceNodesQuery" index="2P8S$" />
      </concept>
      <concept id="1095416546421" name="jetbrains.mps.lang.generator.structure.MappingConfiguration" flags="ig" index="bUwia">
        <child id="1167328349397" name="reductionMappingRule" index="3acgRq" />
        <child id="1167514678247" name="rootMappingRule" index="3lj3bC" />
      </concept>
      <concept id="1168559333462" name="jetbrains.mps.lang.generator.structure.TemplateDeclarationReference" flags="ln" index="j$656" />
      <concept id="1168619357332" name="jetbrains.mps.lang.generator.structure.RootTemplateAnnotation" flags="lg" index="n94m4">
        <reference id="1168619429071" name="applicableConcept" index="n9lRv" />
      </concept>
      <concept id="1095672379244" name="jetbrains.mps.lang.generator.structure.TemplateFragment" flags="ng" index="raruj" />
      <concept id="1722980698497626400" name="jetbrains.mps.lang.generator.structure.ITemplateCall" flags="ngI" index="v9R3L">
        <reference id="1722980698497626483" name="template" index="v9R2y" />
      </concept>
      <concept id="1167169188348" name="jetbrains.mps.lang.generator.structure.TemplateFunctionParameter_sourceNode" flags="nn" index="30H73N" />
      <concept id="1167169308231" name="jetbrains.mps.lang.generator.structure.BaseMappingRule" flags="ng" index="30H$t8">
        <reference id="1167169349424" name="applicableConcept" index="30HIoZ" />
      </concept>
      <concept id="1092059087312" name="jetbrains.mps.lang.generator.structure.TemplateDeclaration" flags="ig" index="13MO4I">
        <reference id="1168285871518" name="applicableConcept" index="3gUMe" />
        <child id="1092060348987" name="contentNode" index="13RCb5" />
      </concept>
      <concept id="1087833241328" name="jetbrains.mps.lang.generator.structure.PropertyMacro" flags="ln" index="17Uvod">
        <child id="1167756362303" name="propertyValueFunction" index="3zH0cK" />
      </concept>
      <concept id="1167327847730" name="jetbrains.mps.lang.generator.structure.Reduction_MappingRule" flags="lg" index="3aamgX">
        <child id="1169672767469" name="ruleConsequence" index="1lVwrX" />
      </concept>
      <concept id="1167514355419" name="jetbrains.mps.lang.generator.structure.Root_MappingRule" flags="lg" index="3lhOvk">
        <reference id="1167514355421" name="template" index="3lhOvi" />
      </concept>
      <concept id="1167756080639" name="jetbrains.mps.lang.generator.structure.PropertyMacro_GetPropertyValue" flags="in" index="3zFVjK" />
      <concept id="1167951910403" name="jetbrains.mps.lang.generator.structure.SourceSubstituteMacro_SourceNodesQuery" flags="in" index="3JmXsc" />
    </language>
    <language id="7866978e-a0f0-4cc7-81bc-4d213d9375e1" name="jetbrains.mps.lang.smodel">
      <concept id="1138056022639" name="jetbrains.mps.lang.smodel.structure.SPropertyAccess" flags="nn" index="3TrcHB">
        <reference id="1138056395725" name="property" index="3TsBF5" />
      </concept>
      <concept id="1138056282393" name="jetbrains.mps.lang.smodel.structure.SLinkListAccess" flags="nn" index="3Tsc0h">
        <reference id="1138056546658" name="link" index="3TtcxE" />
      </concept>
    </language>
    <language id="ceab5195-25ea-4f22-9b92-103b95ca8c0c" name="jetbrains.mps.lang.core">
      <concept id="1133920641626" name="jetbrains.mps.lang.core.structure.BaseConcept" flags="ng" index="2VYdi">
        <child id="5169995583184591170" name="smodelAttribute" index="lGtFl" />
      </concept>
      <concept id="3364660638048049750" name="jetbrains.mps.lang.core.structure.PropertyAttribute" flags="ng" index="A9Btg">
        <property id="1757699476691236117" name="name_DebugInfo" index="2qtEX9" />
        <property id="1341860900487648621" name="propertyId" index="P4ACc" />
      </concept>
      <concept id="1169194658468" name="jetbrains.mps.lang.core.structure.INamedConcept" flags="ngI" index="TrEIO">
        <property id="1169194664001" name="name" index="TrG5h" />
      </concept>
    </language>
  </registry>
  <node concept="bUwia" id="1qbgIlh$tWB">
    <property role="TrG5h" value="main" />
    <node concept="3aamgX" id="1qbgIlh_Ceg" role="3acgRq">
      <ref role="30HIoZ" to="htms:1qbgIlh$tWM" resolve="Sensor" />
      <node concept="j$656" id="1qbgIlh_Cjq" role="1lVwrX">
        <ref role="v9R2y" node="1qbgIlh_Cjo" resolve="reduce_Sensor" />
      </node>
    </node>
    <node concept="3aamgX" id="1qbgIlhAuTO" role="3acgRq">
      <ref role="30HIoZ" to="htms:1qbgIlh$tWL" resolve="Actuator" />
      <node concept="j$656" id="1qbgIlhAuYY" role="1lVwrX">
        <ref role="v9R2y" node="1qbgIlhAuYW" resolve="reduce_Actuator" />
      </node>
    </node>
    <node concept="3lhOvk" id="1qbgIlh$Kd5" role="3lj3bC">
      <ref role="30HIoZ" to="htms:1qbgIlh$tWG" resolve="App" />
      <ref role="3lhOvi" node="1qbgIlh$Olj" resolve="map_App" />
    </node>
  </node>
  <node concept="13MO4I" id="1qbgIlh_Cjo">
    <property role="TrG5h" value="reduce_Sensor" />
    <ref role="3gUMe" to="htms:1qbgIlh$tWM" resolve="Sensor" />
    <node concept="9aQIb" id="1qbgIlh_CkH" role="13RCb5">
      <node concept="3clFbS" id="1qbgIlh_CkI" role="9aQI4">
        <node concept="raruj" id="1qbgIlh_VJU" role="lGtFl" />
        <node concept="3clFbF" id="1qbgIlh_VLC" role="3cqZAp">
          <node concept="2OqwBi" id="1qbgIlhA6Pf" role="3clFbG">
            <node concept="10M0yZ" id="1qbgIlh_VML" role="2Oq$k0">
              <ref role="3cqZAo" to="wyt6:~System.out" resolve="out" />
              <ref role="1PxDUh" to="wyt6:~System" resolve="System" />
            </node>
            <node concept="liA8E" id="1qbgIlhA7$l" role="2OqNvi">
              <ref role="37wK5l" to="guwi:~PrintStream.println(java.lang.String)" resolve="println" />
              <node concept="3cpWs3" id="1qbgIlhAsOL" role="37wK5m">
                <node concept="Xl_RD" id="1qbgIlhAtnJ" role="3uHU7w">
                  <property role="Xl_RC" value=", INPUT);" />
                </node>
                <node concept="3cpWs3" id="1qbgIlhAoby" role="3uHU7B">
                  <node concept="Xl_RD" id="1qbgIlhAmyk" role="3uHU7B">
                    <property role="Xl_RC" value="pinMode(" />
                  </node>
                  <node concept="3cmrfG" id="1qbgIlhAokq" role="3uHU7w">
                    <property role="3cmrfH" value="0" />
                    <node concept="17Uvod" id="1qbgIlhAuoS" role="lGtFl">
                      <property role="2qtEX9" value="value" />
                      <property role="P4ACc" value="f3061a53-9226-4cc5-a443-f952ceaf5816/1068580320020/1068580320021" />
                      <node concept="3zFVjK" id="1qbgIlhAuoV" role="3zH0cK">
                        <node concept="3clFbS" id="1qbgIlhAuoW" role="2VODD2">
                          <node concept="3clFbF" id="1qbgIlhAup2" role="3cqZAp">
                            <node concept="2OqwBi" id="1qbgIlhAuoX" role="3clFbG">
                              <node concept="3TrcHB" id="1qbgIlhAup0" role="2OqNvi">
                                <ref role="3TsBF5" to="htms:1qbgIlh$tWJ" resolve="pin" />
                              </node>
                              <node concept="30H73N" id="1qbgIlhAup1" role="2Oq$k0" />
                            </node>
                          </node>
                        </node>
                      </node>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
      </node>
    </node>
  </node>
  <node concept="13MO4I" id="1qbgIlhAuYW">
    <property role="TrG5h" value="reduce_Actuator" />
    <ref role="3gUMe" to="htms:1qbgIlh$tWL" resolve="Actuator" />
    <node concept="9aQIb" id="1qbgIlhAv1y" role="13RCb5">
      <node concept="3clFbS" id="1qbgIlhAv1z" role="9aQI4">
        <node concept="raruj" id="1qbgIlhAv2q" role="lGtFl" />
        <node concept="3clFbF" id="1qbgIlhAv3i" role="3cqZAp">
          <node concept="2OqwBi" id="1qbgIlhAvCh" role="3clFbG">
            <node concept="10M0yZ" id="1qbgIlhAv4k" role="2Oq$k0">
              <ref role="3cqZAo" to="wyt6:~System.out" resolve="out" />
              <ref role="1PxDUh" to="wyt6:~System" resolve="System" />
            </node>
            <node concept="liA8E" id="1qbgIlhAw7a" role="2OqNvi">
              <ref role="37wK5l" to="guwi:~PrintStream.println(java.lang.String)" resolve="println" />
              <node concept="3cpWs3" id="1qbgIlhA$ec" role="37wK5m">
                <node concept="Xl_RD" id="1qbgIlhA$n6" role="3uHU7w">
                  <property role="Xl_RC" value=", OUTPUT);" />
                </node>
                <node concept="3cpWs3" id="1qbgIlhAxpK" role="3uHU7B">
                  <node concept="Xl_RD" id="1qbgIlhAwgY" role="3uHU7B">
                    <property role="Xl_RC" value=" pinMode(" />
                  </node>
                  <node concept="3cmrfG" id="1qbgIlhAxs$" role="3uHU7w">
                    <property role="3cmrfH" value="0" />
                    <node concept="17Uvod" id="1qbgIlhA_ki" role="lGtFl">
                      <property role="2qtEX9" value="value" />
                      <property role="P4ACc" value="f3061a53-9226-4cc5-a443-f952ceaf5816/1068580320020/1068580320021" />
                      <node concept="3zFVjK" id="1qbgIlhA_kl" role="3zH0cK">
                        <node concept="3clFbS" id="1qbgIlhA_km" role="2VODD2">
                          <node concept="3clFbF" id="1qbgIlhA_ks" role="3cqZAp">
                            <node concept="2OqwBi" id="1qbgIlhA_kn" role="3clFbG">
                              <node concept="3TrcHB" id="1qbgIlhA_kq" role="2OqNvi">
                                <ref role="3TsBF5" to="htms:1qbgIlh$tWJ" resolve="pin" />
                              </node>
                              <node concept="30H73N" id="1qbgIlhA_kr" role="2Oq$k0" />
                            </node>
                          </node>
                        </node>
                      </node>
                    </node>
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
      </node>
    </node>
  </node>
  <node concept="312cEu" id="1qbgIlh$Olj">
    <property role="TrG5h" value="map_App" />
    <node concept="2YIFZL" id="1qbgIlh$Org" role="jymVt">
      <property role="TrG5h" value="main" />
      <node concept="3clFbS" id="1qbgIlh$Orj" role="3clF47">
        <node concept="3clFbF" id="1qbgIlh$OC0" role="3cqZAp">
          <node concept="2OqwBi" id="1qbgIlh$PaD" role="3clFbG">
            <node concept="10M0yZ" id="1qbgIlh$OFX" role="2Oq$k0">
              <ref role="3cqZAo" to="wyt6:~System.out" resolve="out" />
              <ref role="1PxDUh" to="wyt6:~System" resolve="System" />
            </node>
            <node concept="liA8E" id="1qbgIlh$RDR" role="2OqNvi">
              <ref role="37wK5l" to="guwi:~PrintStream.println(java.lang.String)" resolve="println" />
              <node concept="Xl_RD" id="1qbgIlh$RGj" role="37wK5m">
                <property role="Xl_RC" value="// Code Generated by ArduinoML" />
              </node>
            </node>
          </node>
        </node>
        <node concept="3clFbH" id="1qbgIlh$SYZ" role="3cqZAp" />
        <node concept="3clFbF" id="1qbgIlh$T5S" role="3cqZAp">
          <node concept="2OqwBi" id="1qbgIlh$TAm" role="3clFbG">
            <node concept="10M0yZ" id="1qbgIlh$T7l" role="2Oq$k0">
              <ref role="3cqZAo" to="wyt6:~System.out" resolve="out" />
              <ref role="1PxDUh" to="wyt6:~System" resolve="System" />
            </node>
            <node concept="liA8E" id="1qbgIlh$Utg" role="2OqNvi">
              <ref role="37wK5l" to="guwi:~PrintStream.println(java.lang.String)" resolve="println" />
              <node concept="Xl_RD" id="1qbgIlh$UKI" role="37wK5m">
                <property role="Xl_RC" value=" void setup() {" />
              </node>
            </node>
          </node>
        </node>
        <node concept="3clFbF" id="1qbgIlh$VrA" role="3cqZAp">
          <node concept="2OqwBi" id="1qbgIlh$VXW" role="3clFbG">
            <node concept="10M0yZ" id="1qbgIlh$Vt3" role="2Oq$k0">
              <ref role="3cqZAo" to="wyt6:~System.out" resolve="out" />
              <ref role="1PxDUh" to="wyt6:~System" resolve="System" />
            </node>
            <node concept="liA8E" id="1qbgIlh$Waq" role="2OqNvi">
              <ref role="37wK5l" to="guwi:~PrintStream.println(java.lang.String)" resolve="println" />
              <node concept="Xl_RD" id="1qbgIlh$We$" role="37wK5m">
                <property role="Xl_RC" value="// bricks" />
              </node>
            </node>
          </node>
          <node concept="2b32R4" id="1qbgIlhAGHq" role="lGtFl">
            <node concept="3JmXsc" id="1qbgIlhAGHt" role="2P8S$">
              <node concept="3clFbS" id="1qbgIlhAGHu" role="2VODD2">
                <node concept="3clFbF" id="1qbgIlhAGH$" role="3cqZAp">
                  <node concept="2OqwBi" id="1qbgIlhAGHv" role="3clFbG">
                    <node concept="3Tsc0h" id="1qbgIlhAGHy" role="2OqNvi">
                      <ref role="3TtcxE" to="htms:1qbgIlh$tWN" resolve="bricks" />
                    </node>
                    <node concept="30H73N" id="1qbgIlhAGHz" role="2Oq$k0" />
                  </node>
                </node>
              </node>
            </node>
          </node>
        </node>
        <node concept="3clFbF" id="1qbgIlh$WQp" role="3cqZAp">
          <node concept="2OqwBi" id="1qbgIlh$X0b" role="3clFbG">
            <node concept="10M0yZ" id="1qbgIlh$WRQ" role="2Oq$k0">
              <ref role="3cqZAo" to="wyt6:~System.out" resolve="out" />
              <ref role="1PxDUh" to="wyt6:~System" resolve="System" />
            </node>
            <node concept="liA8E" id="1qbgIlh$XbW" role="2OqNvi">
              <ref role="37wK5l" to="guwi:~PrintStream.println(java.lang.String)" resolve="println" />
              <node concept="Xl_RD" id="1qbgIlh$Xqd" role="37wK5m">
                <property role="Xl_RC" value="}" />
              </node>
            </node>
          </node>
        </node>
      </node>
      <node concept="3Tm1VV" id="1qbgIlh$OqL" role="1B3o_S" />
      <node concept="3cqZAl" id="1qbgIlh$Or6" role="3clF45" />
      <node concept="37vLTG" id="1qbgIlh$OrI" role="3clF46">
        <property role="TrG5h" value="args" />
        <node concept="10Q1$e" id="1qbgIlh$OtZ" role="1tU5fm">
          <node concept="17QB3L" id="1qbgIlh$OrH" role="10Q1$1" />
        </node>
      </node>
    </node>
    <node concept="3Tm1VV" id="1qbgIlh$Olk" role="1B3o_S" />
    <node concept="n94m4" id="1qbgIlh$Oll" role="lGtFl">
      <ref role="n9lRv" to="htms:1qbgIlh$tWG" resolve="App" />
    </node>
  </node>
</model>

